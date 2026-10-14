# Waitly

Landing page en español para estudiantes del curso de Cloudflare Workers de Platzi.
Su acción principal es probar el registro de una lista de espera. La demo no persiste datos.

## Dirección visual

Minimalismo tecnológico amable: tipografía Manrope para títulos, DM Sans para texto,
azul tinta y acento naranja. El titular con un primer paso destacado es el elemento
principal. Dos columnas en escritorio y una en móvil; sin ilustraciones decorativas.

## Tokens y propiedad

La fuente de valores en runtime es `frontend/src/styles.css`, en `:root`:
canvas #f3f6f8, surface #ffffff, ink #183549, muted #526775, accent #c6471d,
border #d4dfe5, success #246248 y error #a32e2e.
No existe una segunda exportación de tokens. Fonts externas con fallback sans-serif.

## Formulario

Un solo formulario accesible con validación propia, foco en el correo inválido,
estados idle/loading/success/error, región de estado anunciada y espacio reservado.
El correo se conserva ante errores. El envío pendiente bloquea duplicados.
Editar el correo permite otra prueba tras el éxito. Peticiones con límite de 10 segundos.
La demo nunca promete enviar notificaciones. Contraste, foco y movimiento reducido
son parte de la identidad.
