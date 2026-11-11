using AgroLinkAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace AgroLinkAPI.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(
        DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();

    public DbSet<Crop> Crops => Set<Crop>();

    public DbSet<Agrochemical> Agrochemicals
        => Set<Agrochemical>();

    public DbSet<ProductRequest> ProductRequests
        => Set<ProductRequest>();

    public DbSet<Feedback> Feedbacks
        => Set<Feedback>();

    protected override void OnModelCreating(
        ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // --------------------
        // USERS
        // --------------------

        modelBuilder.Entity<User>()
            .HasIndex(user => user.Email)
            .IsUnique();

        // --------------------
        // CROPS
        // --------------------

        modelBuilder.Entity<Crop>()
            .Property(crop => crop.PricePerKg)
            .HasPrecision(18, 2);

        modelBuilder.Entity<Crop>()
            .Property(crop => crop.QuantityInKg)
            .HasPrecision(18, 2);

        modelBuilder.Entity<Crop>()
            .HasOne(crop => crop.Farmer)
            .WithMany(user => user.Crops)
            .HasForeignKey(crop => crop.FarmerId)
            .OnDelete(DeleteBehavior.Restrict);

        // --------------------
        // AGROCHEMICALS
        // --------------------

        modelBuilder.Entity<Agrochemical>()
            .Property(item => item.Price)
            .HasPrecision(18, 2);

        modelBuilder.Entity<Agrochemical>()
            .HasOne(item => item.Seller)
            .WithMany(user => user.Agrochemicals)
            .HasForeignKey(item => item.SellerId)
            .OnDelete(DeleteBehavior.Restrict);

        // --------------------
        // PRODUCT REQUESTS
        // --------------------

        modelBuilder.Entity<ProductRequest>()
            .HasOne(request => request.Farmer)
            .WithMany(user => user.ProductRequests)
            .HasForeignKey(request => request.FarmerId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ProductRequest>()
            .HasOne(request => request.Agrochemical)
            .WithMany()
            .HasForeignKey(request =>
                request.AgrochemicalId)
            .OnDelete(DeleteBehavior.Restrict);

        // --------------------
        // FEEDBACK
        // --------------------

        modelBuilder.Entity<Feedback>()
            .HasOne(feedback => feedback.User)
            .WithMany(user => user.Feedbacks)
            .HasForeignKey(feedback => feedback.UserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}