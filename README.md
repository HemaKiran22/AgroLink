# 🌱 AgroLink

AgroLink is a full-stack web platform that connects **farmers** and **agrochemical sellers**.
Farmers list their crops and request agricultural products. Sellers manage their product
listings and approve, reject or complete farmer requests.

Built with **Angular** and **ASP.NET Core Web API**, using JWT authentication and role-based access.

---

## ✨ Features

### 👨‍🌾 Farmer
- Register and log in securely (JWT)
- Dashboard with live stats: crops, stock, request status overview
- Add, edit and delete crop listings
- Browse agrochemicals with search and category filters
- Send product requests with quantity and a message to the seller
- Track request status (Pending, Approved, Rejected, Completed)
- Delete pending requests
- Give feedback and star ratings

### 🏪 Seller
- Dashboard with product, stock and request statistics
- Approve or reject pending requests directly from the dashboard
- Low stock alerts
- Add, edit and delete agrochemical products
- Review farmer requests with search and status filters
- Stock is reduced automatically when a request is approved
- Browse crops listed by farmers

### 🔐 Security and validation
- JWT authentication with role-based authorization (Farmer / Seller)
- Passwords stored as hashes
- Server-side validation with Data Annotations (name pattern, email, password length, allowed roles)
- Business rules enforced in the API (valid status transitions, stock checks, ownership checks)

### 🎨 User experience
- Responsive design for desktop and mobile
- Toast notifications for success and error messages
- Loading states, empty states and skeleton loaders
- Angular signals and computed values for instant UI updates

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Angular (standalone components, signals, SSR), TypeScript, HTML, CSS |
| Backend | ASP.NET Core Web API, C# |
| ORM | Entity Framework Core |
| Database | PostgreSQL (Neon) |
| Authentication | JWT Bearer tokens |
| API docs | Swagger |
| Version control | Git and GitHub |

---

## 📁 Project Structure

```text
DOTNET_Project/
├── Backend/                 # ASP.NET Core Web API
│   ├── Controllers/         # Auth, Crops, Agrochemicals, ProductRequests, Feedback
│   ├── Models/              # Entity classes
│   ├── DTOs/                # Request/response objects with validation
│   ├── Data/                # AppDbContext
│   ├── Migrations/          # EF Core migrations
│   └── Program.cs
│
└── Frontend/                # Angular application
    └── src/app/
        ├── components/      # Shared components (toast, navbar, etc.)
        ├── farmer/          # Farmer pages
        ├── seller/          # Seller pages
        ├── services/        # API services
        ├── models/          # TypeScript interfaces
        └── guards/          # Route guards
```

---

## 🔄 Request Workflow

```text
Farmer sends request  →  Pending
Seller approves       →  Approved   (stock reduced)
Seller rejects        →  Rejected   (final)
Product handed over   →  Completed  (final)
```

---

## 🚀 Getting Started

### Prerequisites
- .NET SDK
- Node.js and npm
- Angular CLI (`npm install -g @angular/cli`)
- A PostgreSQL database (for example a free Neon database)

### 1. Clone the repository
```bash
git clone https://github.com/HemaKiran22/AgroLink.git
cd AgroLink
```

### 2. Configure the backend
Create `Backend/appsettings.Development.json` (it is ignored by Git):

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "YOUR_DATABASE_CONNECTION_STRING"
  },
  "Jwt": {
    "Key": "YOUR_SECRET_KEY_AT_LEAST_32_CHARACTERS"
  }
}
```

### 3. Run the backend
```bash
cd Backend
dotnet restore
dotnet ef database update
dotnet run
```
Swagger is available at `https://localhost:<port>/swagger`.

### 4. Run the frontend
```bash
cd Frontend
npm install
ng serve
```
Open `http://localhost:4200`.

If your API runs on a different port, update the API URL in the Angular services.

---

## 📡 Main API Endpoints

| Method | Endpoint | Role |
|---|---|---|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| POST | `/api/productrequests` | Farmer |
| GET | `/api/productrequests/my-requests` | Farmer |
| DELETE | `/api/productrequests/{id}` | Farmer |
| GET | `/api/productrequests/seller-requests` | Seller |
| PUT | `/api/productrequests/{id}/status` | Seller |

---

## ☁️ Render deployment

The repository includes `render.yaml`, which deploys the API and Angular SSR frontend
as separate Render services. It uses the existing Neon PostgreSQL database; no database
resource is created on Render.

The GitHub Actions workflow `.github/workflows/deploy-render.yml` creates the Blueprint
through the Render API when changes are pushed to `main`. If Render requests them,
set `ConnectionStrings__DefaultConnection` to the Neon connection string and
`Jwt__Key` to a production secret on the `agrolink-api` service.

## 🔮 Future Improvements
- Pickup / home delivery option and delivery tracking
- Online payments
- Product and crop image uploads
- Email notifications
- Admin dashboard
- Deployment to Azure

---

## 👤 Author

**Nallavula Hema Kiran Reddy**
GitHub: [HemaKiran22](https://github.com/HemaKiran22)
