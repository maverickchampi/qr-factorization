# QR Factorization API

API HTTP en Go que autentica usuarios con JWT y calcula la factorización QR de
una matriz usando rotaciones de Givens.

## Requisitos

- Go 1.27 o superior

## Configuración

Crea un archivo `.env` en la raíz del proyecto:

```env
PORT=3010
ALLOWED_ORIGIN=http://localhost:5173
JWT_SECRET=cambia-este-secreto
API_EMAIL=admin@admin.com
API_PASSWORD=admin
```

| Variable         | Descripción                                             | Default |
| ---------------- | ------------------------------------------------------- | ------- |
| `PORT`           | Puerto donde escucha el servidor                        | `8080`  |
| `ALLOWED_ORIGIN` | Origen permitido para CORS                              | -       |
| `JWT_SECRET`     | Secreto usado para firmar y verificar los JWT           | -       |
| `API_EMAIL`      | Email aceptado en el login                              | -       |
| `API_PASSWORD`   | Contraseña aceptada en el login                         | -       |

## Ejecución

```bash
go run .
```

## Tests

```bash
go test ./...
```

## Formato de respuesta

Todas las respuestas son JSON. En caso de éxito:

```json
{
  "success": true,
  "data": {}
}
```

En caso de error:

```json
{
  "success": false,
  "message": "CODIGO_DE_ERROR"
}
```

---

## 1. POST /api/v1/login

Autentica al usuario y devuelve un token JWT válido por 5 minutos.

### Request

```http
POST /api/v1/login
Content-Type: application/json

{
  "email": "admin@admin.com",
  "password": "admin"
}
```

### Response `200 OK`

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...."
  }
}
```

### Errores

| Código                  | HTTP | Descripción                        |
| ----------------------- | ---- | ---------------------------------- |
| `INVALID_REQUEST_BODY`  | 400  | El cuerpo no es un JSON válido     |
| `INVALID_CREDENTIALS`   | 401  | Email o contraseña incorrectos     |

---

## 2. GET /api/v1/validate

Verifica que el token enviado sea válido. Requiere autenticación.

### Request

```http
GET /api/v1/validate
Authorization: Bearer <token>
```

### Response `200 OK`

```json
{
  "success": true
}
```

### Errores

| Código                        | HTTP | Descripción                                     |
| ----------------------------- | ---- | ----------------------------------------------- |
| `MISSING_OR_INVALID_TOKEN`    | 401  | Falta el header `Authorization` o no es `Bearer`|
| `INVALID_TOKEN_FORMAT`        | 401  | El token no tiene el formato `header.payload.sig`|
| `SIGNATURE_VERIFICATION_FAILED` | 401 | La firma del token no coincide                 |
| `CANNOT_DECODE_PAYLOAD`       | 401  | El payload no se puede decodificar en base64    |
| `CANNOT_PARSE_PAYLOAD_JSON`   | 401  | El payload no es un JSON válido                 |
| `TOKEN_EXPIRED`               | 401  | El token ya expiró                              |

---

## 3. POST /api/v1/factorization

Calcula la factorización QR (`A = Q * R`) de una matriz mediante rotaciones de
Givens. Requiere autenticación.

- `Q`: matriz ortogonal de `m x m`.
- `R`: matriz triangular superior de `m x n`.

### Request

```http
POST /api/v1/factorization
Content-Type: application/json
Authorization: Bearer <token>

{
  "matrix": [[12, -51, 4], [6, 167, -68], [-4, 24, -41]]
}
```

### Response `200 OK`

```json
{
  "success": true,
  "data": {
    "q": [[0.8571428571428572, -0.39428571428571424, 0.3314285714285714],
          [0.4285714285714286, 0.9028571428571428, -0.034285714285714274],
          [-0.28571428571428575, 0.1714285714285714, 0.9428571428571427]],
    "r": [[14, 21, -14.000000000000004],
          [0, 175, -70],
          [0, 0, -35]]
  }
}
```

### Errores

| Código                       | HTTP | Descripción                                  |
| ---------------------------- | ---- | -------------------------------------------- |
| `INVALID_REQUEST_BODY`       | 400  | El cuerpo no es un JSON válido               |
| `MATRIX_REQUIRED`            | 400  | La matriz está vacía o no se envió           |
| `INVALID_MATRIX_EMPTY_ROW`   | 400  | Alguna fila de la matriz está vacía          |
| `INVALID_MATRIX_RAGGED`      | 400  | Las filas no tienen todas la misma longitud  |
| `MISSING_OR_INVALID_TOKEN`   | 401  | Token ausente o inválido                     |

## Estructura del proyecto

```
.
├── main.go                        # Arranque del servidor, rutas, CORS y carga de .env
├── main_test.go                   # Test del middleware CORS
├── http/                          # Archivos .http para probar los endpoints
└── internal/
    ├── auth/
    │   ├── auth.go                # Login, generación/validación de JWT y middleware
    │   └── auth_test.go
    ├── factorization/
    │   ├── factorization.go       # Factorización QR con rotaciones de Givens
    │   └── factorization_test.go
    └── response/
        └── response.go            # Helpers de respuesta JSON
```
