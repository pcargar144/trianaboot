import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  onSnapshot, 
  doc, 
  deleteDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged, 
  signInWithCustomToken 
} from 'firebase/auth';
import { 
  MessageSquare, 
  GraduationCap, 
  Settings, 
  Send, 
  Plus, 
  Trash2, 
  Lock, 
  Unlock,
  Loader2,
  Info,
  ChevronRight,
  Sparkles,
  Wand2,
  ListChecks,
  FileText
} from 'lucide-react';

// --- CONFIGURACIÓN DE FIREBASE ---
const firebaseConfig = JSON.parse(__firebase_config);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'edu-chatbot-v1';
const apiKey = ""; // API key inyectada en tiempo de ejecución

const ADMIN_PASSWORD = "admin123";

export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('chat');
  const [messages, setMessages] = useState([]);
  const [knowledgeBase, setKnowledgeBase] = useState([]);
  const [inputText, setInputText] = useState('');
  const [kbInputText, setKbInputText] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiActionLoading, setAiActionLoading] = useState(null); // 'refine', 'faq', 'summary'
  const scrollRef = useRef(null);

  // 1. Autenticación (REGLA 3)
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error("Error de autenticación:", error);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  // 2. Sincronización de Datos (REGLAS 1 y 2)
  useEffect(() => {
    if (!user) return;

    const kbRef = collection(db, 'artifacts', appId, 'public', 'data', 'knowledge');
    const unsubscribeKB = onSnapshot(kbRef, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setKnowledgeBase(data);
    }, (err) => console.error("Error de sincronización KB:", err));

    const msgRef = collection(db, 'artifacts', appId, 'users', user.uid, 'messages');
    const unsubscribeMsg = onSnapshot(msgRef, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(data.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0)));
    }, (err) => console.error("Error de sincronización de mensajes:", err));

    return () => {
      unsubscribeKB();
      unsubscribeMsg();
    };
  }, [user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Llamada genérica a Gemini API con reintentos
  const fetchGemini = async (prompt, systemPrompt, retries = 5) => {
    const delay = (ms) => new Promise(res => setTimeout(res, ms));
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] }
          })
        });
        if (!response.ok) throw new Error("Error en la API");
        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text;
      } catch (err) {
        if (i === retries - 1) throw err;
        await delay(Math.pow(2, i) * 1000);
      }
    }
  };

  // Función: Enviar mensaje al Chatbot
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !user || loading) return;

    const userMsg = inputText;
    setInputText('');
    setLoading(true);

    try {
      await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'messages'), {
        text: userMsg,
        sender: 'user',
        timestamp: Date.now()
      });

      const context = knowledgeBase.map(item => `- ${item.content}`).join('\n');
      const systemPrompt = `Eres un asistente virtual de un centro educativo español. 
      Utiliza esta información específica para responder:
      ${context}
      Responde siempre de forma profesional y amable en español. Si no sabes algo, indícalo educadamente.`;

      const aiResponse = await fetchGemini(userMsg, systemPrompt);

      await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'messages'), {
        text: aiResponse,
        sender: 'bot',
        timestamp: Date.now()
      });
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✨ Función IA: Perfeccionar texto de entrenamiento
  const handleRefineInfo = async () => {
    if (!kbInputText.trim()) return;
    setAiActionLoading('refine');
    try {
      const prompt = `Reescribe este hecho sobre un centro educativo para que sea más formal, claro y profesional, manteniendo el significado original:\n\n"${kbInputText}"`;
      const systemPrompt = "Eres un experto en comunicación institucional educativa.";
      const refinedText = await fetchGemini(prompt, systemPrompt);
      if (refinedText) setKbInputText(refinedText.trim());
    } catch (error) {
      console.error("Error refinando texto:", error);
    } finally {
      setAiActionLoading(null);
    }
  };

  // ✨ Función IA: Generar sugerencias de FAQ basadas en la base de datos actual
  const handleGenerateFAQ = async () => {
    if (knowledgeBase.length === 0) return;
    setAiActionLoading('faq');
    try {
      const context = knowledgeBase.map(item => item.content).join('\n');
      const prompt = `Basándote en esta información del centro:\n${context}\n\nGenera 3 posibles preguntas frecuentes que un padre podría hacer y sus respuestas cortas.`;
      const systemPrompt = "Eres un consultor de atención al cliente para colegios.";
      const faqResult = await fetchGemini(prompt, systemPrompt);
      
      // Añadir la sugerencia de la IA directamente al chat como un mensaje del sistema
      await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'messages'), {
        text: `✨ Sugerencias de Preguntas Frecuentes generadas:\n\n${faqResult}`,
        sender: 'bot',
        timestamp: Date.now()
      });
      setActiveTab('chat');
    } catch (error) {
      console.error("Error generando FAQ:", error);
    } finally {
      setAiActionLoading(null);
    }
  };

  // ✨ Función IA: Resumen de la conversación actual
  const handleSummarizeChat = async () => {
    if (messages.length < 2) return;
    setAiActionLoading('summary');
    try {
      const chatHistory = messages.map(m => `${m.sender}: ${m.text}`).join('\n');
      const prompt = `Resume brevemente los puntos principales de esta conversación entre un usuario y el asistente escolar:\n\n${chatHistory}`;
      const systemPrompt = "Eres un secretario eficiente que resume consultas de padres.";
      const summary = await fetchGemini(prompt, systemPrompt);
      
      await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'messages'), {
        text: `✨ Resumen de nuestra conversación:\n\n${summary}`,
        sender: 'bot',
        timestamp: Date.now()
      });
    } catch (error) {
      console.error("Error resumiendo chat:", error);
    } finally {
      setAiActionLoading(null);
    }
  };

  const addKnowledge = async (e) => {
    e.preventDefault();
    if (!kbInputText.trim()) return;
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'knowledge'), {
        content: kbInputText,
        createdAt: serverTimestamp()
      });
      setKbInputText('');
    } catch (error) {
      console.error("Error añadiendo conocimiento:", error);
    }
  };

  const deleteKnowledge = async (id) => {
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'knowledge', id));
    } catch (error) {
      console.error("Error eliminando conocimiento:", error);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      setIsAdmin(true);
      setPasswordInput('');
    } else {
      alert("Contraseña incorrecta");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Cabecera */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2.5 rounded-2xl text-white shadow-lg shadow-indigo-200">
            <GraduationCap size={28} />
          </div>
          <div>
            <h1 className="font-extrabold text-xl tracking-tight">EduBot <span className="text-indigo-600">Premium</span></h1>
            <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Asistente con IA de Gemini</p>
          </div>
        </div>
        
        <nav className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200">
          <button 
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'chat' ? 'bg-white shadow-md text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <MessageSquare size={18} />
            Chat
          </button>
          <button 
            onClick={() => setActiveTab('train')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'train' ? 'bg-white shadow-md text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Settings size={18} />
            Entrenar
          </button>
        </nav>
      </header>

      {/* Contenido Principal */}
      <main className="flex-1 flex flex-col max-w-5xl w-full mx-auto p-4 md:p-8 overflow-hidden">
        
        {activeTab === 'chat' ? (
          <div className="flex-1 flex flex-col bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-2 uppercase tracking-widest">
                <Sparkles size={14} className="text-indigo-500" />
                Soporte Inteligente
              </span>
              {messages.length > 2 && (
                <button 
                  onClick={handleSummarizeChat}
                  disabled={aiActionLoading === 'summary'}
                  className="text-[10px] bg-white border border-slate-200 px-3 py-1.5 rounded-lg font-bold text-indigo-600 hover:bg-indigo-50 transition-all flex items-center gap-2 shadow-sm"
                >
                  {aiActionLoading === 'summary' ? <Loader2 size={12} className="animate-spin" /> : <FileText size={12} />}
                  Resumir conversación ✨
                </button>
              )}
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/20">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-12">
                  <div className="bg-indigo-50 p-6 rounded-full mb-6">
                    <MessageSquare size={48} className="text-indigo-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800">Bienvenido al Centro</h3>
                  <p className="text-slate-500 max-w-sm mt-2">Nuestro asistente de IA está listo para responder tus dudas usando la información oficial del colegio.</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                    <div className={`max-w-[85%] px-5 py-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                      msg.sender === 'user' 
                        ? 'bg-indigo-600 text-white rounded-br-none font-medium' 
                        : 'bg-white text-slate-800 border border-slate-100 rounded-bl-none'
                    }`}>
                      <div className="whitespace-pre-wrap">{msg.text}</div>
                    </div>
                  </div>
                ))
              )}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-100 px-5 py-3.5 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-3">
                    <Loader2 size={16} className="animate-spin text-indigo-500" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter italic">Generando respuesta con Gemini...</span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 bg-white border-t border-slate-100">
              <form onSubmit={handleSendMessage} className="flex gap-3 bg-slate-100 p-2 rounded-2xl border border-transparent focus-within:border-indigo-200 transition-all focus-within:bg-white shadow-inner">
                <input 
                  type="text" 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="¿Cuál es tu consulta?"
                  className="flex-1 bg-transparent border-none px-4 py-2 text-sm focus:ring-0 outline-none"
                />
                <button 
                  type="submit"
                  disabled={loading || !inputText.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white p-3 rounded-xl transition-all shadow-lg shadow-indigo-100"
                >
                  <Send size={20} />
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* Panel de Entrenamiento con IA */
          <div className="flex-1 flex flex-col space-y-6 max-w-4xl mx-auto w-full">
            {!isAdmin ? (
              <div className="bg-white rounded-3xl p-12 border border-slate-200 shadow-xl flex flex-col items-center justify-center text-center space-y-6 mt-10">
                <div className="bg-slate-100 p-6 rounded-3xl text-slate-400"><Lock size={48} /></div>
                <div>
                  <h2 className="text-2xl font-black text-slate-800">Panel de Administración</h2>
                  <p className="text-slate-500 text-sm mt-2">Introduce la contraseña para gestionar el conocimiento del bot.</p>
                </div>
                <form onSubmit={handleLogin} className="w-full max-w-xs space-y-4">
                  <input 
                    type="password" 
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Contraseña"
                    className="w-full px-5 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                  <button type="submit" className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-indigo-600 transition-all shadow-lg">Entrar</button>
                </form>
              </div>
            ) : (
              <div className="flex-1 flex flex-col space-y-6 overflow-hidden">
                <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-lg">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-extrabold text-lg flex items-center gap-2">
                      <Unlock size={20} className="text-green-500" /> 
                      Entrenamiento con IA ✨
                    </h2>
                    <button onClick={() => setIsAdmin(false)} className="text-xs font-bold text-red-400 uppercase tracking-wider">Cerrar Sesión</button>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-end">
                        <label className="text-xs font-black uppercase text-slate-400 ml-1">Información del Centro</label>
                        <button 
                          onClick={handleRefineInfo}
                          disabled={!kbInputText.trim() || aiActionLoading === 'refine'}
                          className="text-[10px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg flex items-center gap-2 transition-all border border-indigo-100"
                        >
                          {aiActionLoading === 'refine' ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
                          Mejorar con IA ✨
                        </button>
                      </div>
                      <textarea 
                        value={kbInputText}
                        onChange={(e) => setKbInputText(e.target.value)}
                        placeholder="Escribe un dato sobre el colegio..."
                        className="w-full min-h-[100px] p-4 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none resize-none transition-all"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button 
                        onClick={addKnowledge}
                        className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 flex items-center justify-center gap-2"
                      >
                        <Plus size={18} /> Guardar Hecho
                      </button>
                      <button 
                        onClick={handleGenerateFAQ}
                        disabled={knowledgeBase.length === 0 || aiActionLoading === 'faq'}
                        className="flex-1 bg-white border border-slate-200 text-slate-700 px-6 py-3 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all shadow-sm flex items-center justify-center gap-2"
                      >
                        {aiActionLoading === 'faq' ? <Loader2 size={18} className="animate-spin" /> : <ListChecks size={18} className="text-indigo-500" />}
                        Sugerir FAQ ✨
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden flex flex-col">
                  <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <h3 className="font-black text-slate-700 text-xs uppercase tracking-widest">Base de Conocimiento Actual</h3>
                    <div className="bg-indigo-600 text-white text-[10px] px-2.5 py-1 rounded-full font-black">{knowledgeBase.length} ENTRADAS</div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {knowledgeBase.length === 0 ? (
                      <p className="text-center text-slate-400 text-sm py-12">No hay datos todavía. Usa la IA para empezar.</p>
                    ) : (
                      knowledgeBase.map((item) => (
                        <div key={item.id} className="bg-white p-4 rounded-2xl border border-slate-100 flex justify-between items-start gap-4 group hover:shadow-md transition-all">
                          <p className="text-sm text-slate-600 leading-relaxed">{item.content}</p>
                          <button onClick={() => deleteKnowledge(item.id)} className="text-slate-300 hover:text-red-500 p-2 bg-slate-50 rounded-xl transition-colors"><Trash2 size={16} /></button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="py-6 text-center text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
        Plataforma Inteligente v2.0 &bull; Impulsada por Gemini API
      </footer>
    </div>
  );
}
