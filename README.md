# 🎓 Triana Boot

Un chatbot interactivo y fácil de usar para centros educativos, diseñado para que los **alumnos lo entrenen** sin necesidad de programar.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

## 🌟 Características

- ✅ **Sin instalación**: Solo abre el archivo HTML en tu navegador
- 🎯 **Entrenamiento simple**: Los alumnos añaden preguntas y respuestas desde la interfaz
- 💾 **Guardado automático**: Los datos se guardan en el navegador (localStorage)
- 🔍 **Búsqueda inteligente**: Encuentra respuestas aunque la pregunta no sea exacta
- 📊 **Estadísticas en tiempo real**: Cuenta preguntas realizadas y conocimientos almacenados
- 📥 **Exportar/Importar**: Comparte la base de conocimiento entre diferentes ordenadores
- 📱 **Responsive**: Funciona en móviles, tablets y ordenadores
- 🎨 **Diseño moderno**: Interfaz atractiva y fácil de usar

## 🚀 Inicio Rápido

### Opción 1: Descarga directa
1. Descarga el archivo `chatbot-educativo.html`
2. Haz doble clic en el archivo
3. ¡Ya está funcionando! 🎉

### Opción 2: Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/chatbot-educativo.git
cd chatbot-educativo
```
Luego abre `chatbot-educativo.html` en tu navegador favorito.

## 📖 Cómo Usar

### Para Alumnos: Entrenar al Bot

1. **Ve a la sección "Entrena al Bot"** (lado derecho)
2. **Escribe una pregunta** en el primer campo
   - Ejemplo: `¿Cuál es el horario del centro?`
3. **Escribe la respuesta** en el área de texto
   - Ejemplo: `El horario es de 8:00 a 14:00 de lunes a viernes`
4. **Haz clic en "Añadir Conocimiento"**
5. ¡Listo! El bot ya puede responder esa pregunta

### Para Alumnos: Hacer Preguntas

1. **Escribe tu pregunta** en el chat (lado izquierdo)
2. **Presiona Enter** o haz clic en "Enviar"
3. El bot buscará en su base de conocimiento y responderá

### Para Profesores: Compartir Conocimiento

#### Exportar datos:
1. Haz clic en **"Exportar Datos"**
2. Se descargará un archivo `chatbot-conocimiento.json`
3. Comparte este archivo con otros alumnos/profesores

#### Importar datos:
1. Haz clic en **"Importar Datos"**
2. Selecciona el archivo `.json` que recibiste
3. ¡Toda la base de conocimiento se cargará automáticamente!

## 💡 Ejemplos de Uso

### Ejemplo 1: Información del Centro
```
Pregunta: ¿Dónde está ubicado el centro?
Respuesta: Nuestro centro está en la Calle Principal 123, Sevilla.
```

### Ejemplo 2: Horarios
```
Pregunta: horario biblioteca
Respuesta: La biblioteca está abierta de 8:30 a 18:00 de lunes a viernes.
```

### Ejemplo 3: Actividades
```
Pregunta: ¿Qué actividades extraescolares hay?
Respuesta: Ofrecemos fútbol, baloncesto, teatro, música y robótica.
```

### Ejemplo 4: Normas
```
Pregunta: ¿Se puede usar el móvil?
Respuesta: Los móviles deben estar en modo silencio durante las clases.
```

## 🔧 Funcionalidades Técnicas

### Sistema de Búsqueda
El bot utiliza un algoritmo de coincidencia inteligente:
- Busca coincidencias exactas
- Busca coincidencias parciales
- Busca por palabras clave (mínimo 3 letras)
- No distingue entre mayúsculas y minúsculas

### Almacenamiento de Datos
- Los datos se guardan en **localStorage** del navegador
- Persistencia automática después de cada cambio
- Capacidad: hasta ~5-10MB (miles de preguntas)

### Formato de Exportación
El archivo JSON tiene esta estructura:
```json
[
  {
    "question": "horario",
    "answer": "El horario del centro es de 8:00 a 14:00"
  },
  {
    "question": "contacto",
    "answer": "Teléfono: 954-XXX-XXX"
  }
]
```

## 🎨 Personalización

### Cambiar Colores
Edita las variables CSS en la sección `<style>`:

```css
/* Color principal */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Color de los botones */
background: #667eea;

/* Colores de los mensajes */
.user-message {
    background: #667eea; /* Mensajes del usuario */
}

.bot-message {
    background: #e8eaf6; /* Mensajes del bot */
}
```

### Cambiar Textos
Busca y modifica estos textos en el HTML:

```html
<!-- Título principal -->
<h1>🎓 ChatBot Educativo</h1>

<!-- Mensaje de bienvenida del bot -->
<strong>Bot:</strong> ¡Hola! Soy el asistente virtual...
```

## 📊 Casos de Uso Reales

### 🏫 Para Centros Educativos
- Responder preguntas frecuentes de alumnos
- Información sobre horarios y actividades
- Normas y reglamentos del centro
- Contactos y ubicaciones

### 📚 Para Bibliotecas
- Horarios de apertura
- Cómo solicitar libros
- Normas de la biblioteca
- Eventos y actividades

### 🎯 Para Proyectos de Clase
- Los alumnos aprenden sobre IA
- Proyecto colaborativo de clase
- Base de conocimiento sobre un tema específico
- Práctica de redacción y síntesis

## 🔒 Privacidad y Seguridad

- ✅ **Sin servidor**: Todo funciona localmente en el navegador
- ✅ **Sin recopilación de datos**: No se envía información a internet
- ✅ **Sin registro**: No requiere cuentas ni contraseñas
- ✅ **100% offline**: Funciona sin conexión a internet

## 🐛 Solución de Problemas

### El bot no guarda los datos
**Solución**: Asegúrate de que el navegador permita localStorage. En modo incógnito no se guardarán los datos permanentemente.

### El bot no responde bien
**Solución**: 
1. Añade más variaciones de la misma pregunta
2. Usa palabras clave más específicas
3. Revisa que la respuesta esté bien escrita

### Perdí todos los datos
**Solución**: 
1. Si exportaste antes, importa el archivo JSON
2. Si no, los datos se borraron (por eso es importante exportar regularmente)

### No funciona en mi navegador
**Solución**: Usa un navegador moderno:
- ✅ Chrome (recomendado)
- ✅ Firefox
- ✅ Edge
- ✅ Safari
- ❌ Internet Explorer (no compatible)

## 📝 Roadmap Futuro

- [ ] Modo administrador con contraseña
- [ ] Categorías de preguntas
- [ ] Búsqueda con sinónimos
- [ ] Estadísticas avanzadas (preguntas más frecuentes)
- [ ] Modo multi-idioma
- [ ] Integración con APIs externas (opcional)

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Si quieres mejorar el proyecto:

1. Haz un Fork del repositorio
2. Crea una rama (`git checkout -b feature/mejora`)
3. Haz commit de tus cambios (`git commit -m 'Añadir nueva funcionalidad'`)
4. Sube los cambios (`git push origin feature/mejora`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Puedes usarlo, modificarlo y distribuirlo libremente.

## 👥 Autores

Creado con ❤️ para facilitar el aprendizaje en centros educativos.

## 📧 Contacto y Soporte

- 🐛 **Reportar un bug**: Abre un Issue en GitHub
- 💡 **Sugerir mejora**: Abre un Issue con la etiqueta "enhancement"
- 📖 **Documentación**: Lee este README completo

## 🌟 Dale una Estrella

Si este proyecto te ha sido útil, ¡dale una estrella! ⭐

---

**Hecho con** 💜 **para educadores y estudiantes**

## 📸 Capturas de Pantalla

### Vista Principal
```
┌─────────────────────────────────────────────────────────┐
│  🎓 ChatBot Educativo                                    │
│  Pregunta y aprende sobre nuestro centro                │
├──────────────────────┬──────────────────────────────────┤
│  💬 Habla con el Bot │  🎯 Entrena al Bot               │
│                      │                                  │
│  [Chat interactivo]  │  [Formulario de entrenamiento]   │
│                      │                                  │
│  Usuario: ¿Horario?  │  Nueva pregunta: [_______]       │
│  Bot: De 8 a 14h     │  Nueva respuesta: [_______]       │
│                      │  [➕ Añadir Conocimiento]         │
│  [Escribe aquí...]   │                                  │
│  [Enviar]            │  Lista de conocimientos:         │
│                      │  • Pregunta 1                    │
│  Preguntas: 5        │  • Pregunta 2                    │
│  Respuestas: 12      │  • Pregunta 3                    │
└──────────────────────┴──────────────────────────────────┘
```

## 🎓 Consejos Pedagógicos

### Para Profesores
1. **Proyecto de clase**: Asigna a diferentes grupos temas específicos (horarios, normas, actividades)
2. **Control de calidad**: Revisa las respuestas antes de exportar
3. **Actualización regular**: Dedica 10 minutos semanales a actualizar info
4. **Gamificación**: Premia al grupo que añada más conocimiento útil

### Para Alumnos
1. **Sé específico**: Escribe preguntas claras y directas
2. **Respuestas completas**: Incluye toda la información necesaria
3. **Revisa ortografía**: Las respuestas representan al centro
4. **Piensa en variaciones**: Añade diferentes formas de hacer la misma pregunta

---

**¿Preguntas? ¿Sugerencias?** Abre un Issue y te ayudaremos 😊
