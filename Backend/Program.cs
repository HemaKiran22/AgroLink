using System.Text;

using AgroLinkAPI.Data;
using AgroLinkAPI.Models;
using AgroLinkAPI.Services;

using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);


// =============================================
// 1. CONTROLLERS
// =============================================

builder.Services.AddControllers();


// =============================================
// 2. SWAGGER / OPENAPI
// =============================================

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();


// =============================================
// 3. DATABASE CONNECTION
// =============================================

var connectionString =
    builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException(
        "DefaultConnection is missing."
    );

builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseNpgsql(connectionString);
});


// =============================================
// 4. PASSWORD HASHER
// =============================================

builder.Services.AddScoped<
    IPasswordHasher<User>,
    PasswordHasher<User>
>();


// =============================================
// 5. TOKEN SERVICE
// =============================================

builder.Services.AddScoped<TokenService>();


// =============================================
// 6. JWT SETTINGS
// =============================================

var jwtKey =
    builder.Configuration["Jwt:Key"]
    ?? throw new InvalidOperationException(
        "JWT key is missing."
    );

var jwtIssuer =
    builder.Configuration["Jwt:Issuer"]
    ?? throw new InvalidOperationException(
        "JWT issuer is missing."
    );

var jwtAudience =
    builder.Configuration["Jwt:Audience"]
    ?? throw new InvalidOperationException(
        "JWT audience is missing."
    );


// =============================================
// 7. JWT AUTHENTICATION
// =============================================

builder.Services
    .AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme =
            JwtBearerDefaults.AuthenticationScheme;

        options.DefaultChallengeScheme =
            JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters =
            new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,

                ValidIssuer = jwtIssuer,
                ValidAudience = jwtAudience,

                IssuerSigningKey =
                    new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(jwtKey)
                    ),

                ClockSkew = TimeSpan.Zero
            };
    });


// =============================================
// 8. AUTHORIZATION
// =============================================

builder.Services.AddAuthorization();


// =============================================
// 9. CORS
// =============================================

// Reads:
// Cors:Origins:0
// Cors:Origins:1
//
// Azure environment variables:
// Cors__Origins__0
// Cors__Origins__1

var corsOrigins =
    builder.Configuration
        .GetSection("Cors:Origins")
        .Get<string[]>()
    ?? new[]
    {
        "https://guileless-gaufre-67a3ce.netlify.app/"
    };

builder.Services.AddCors(options =>
{
    options.AddPolicy(
        "AngularPolicy",
        policy =>
        {
            policy
                .WithOrigins(corsOrigins)
                .AllowAnyHeader()
                .AllowAnyMethod();
        }
    );
});


// =============================================
// BUILD APPLICATION
// =============================================

var app = builder.Build();


// =============================================
// 10. SWAGGER
// =============================================

// Development Swagger
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}


// =============================================
// 11. HTTPS
// =============================================

app.UseHttpsRedirection();


// =============================================
// 12. CORS
// =============================================

app.UseCors("AngularPolicy");


// =============================================
// 13. AUTHENTICATION
// =============================================

app.UseAuthentication();


// =============================================
// 14. AUTHORIZATION
// =============================================

app.UseAuthorization();


// =============================================
// 15. MAP CONTROLLERS
// =============================================

app.MapControllers();


// =============================================
// RUN APPLICATION
// =============================================

app.Run();