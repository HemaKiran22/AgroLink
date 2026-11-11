using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddEntityRelationships : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_ProductRequests_AgrochemicalId",
                table: "ProductRequests",
                column: "AgrochemicalId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductRequests_FarmerId",
                table: "ProductRequests",
                column: "FarmerId");

            migrationBuilder.CreateIndex(
                name: "IX_Feedbacks_UserId",
                table: "Feedbacks",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Crops_FarmerId",
                table: "Crops",
                column: "FarmerId");

            migrationBuilder.CreateIndex(
                name: "IX_Agrochemicals_SellerId",
                table: "Agrochemicals",
                column: "SellerId");

            migrationBuilder.AddForeignKey(
                name: "FK_Agrochemicals_Users_SellerId",
                table: "Agrochemicals",
                column: "SellerId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Crops_Users_FarmerId",
                table: "Crops",
                column: "FarmerId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Feedbacks_Users_UserId",
                table: "Feedbacks",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ProductRequests_Agrochemicals_AgrochemicalId",
                table: "ProductRequests",
                column: "AgrochemicalId",
                principalTable: "Agrochemicals",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ProductRequests_Users_FarmerId",
                table: "ProductRequests",
                column: "FarmerId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Agrochemicals_Users_SellerId",
                table: "Agrochemicals");

            migrationBuilder.DropForeignKey(
                name: "FK_Crops_Users_FarmerId",
                table: "Crops");

            migrationBuilder.DropForeignKey(
                name: "FK_Feedbacks_Users_UserId",
                table: "Feedbacks");

            migrationBuilder.DropForeignKey(
                name: "FK_ProductRequests_Agrochemicals_AgrochemicalId",
                table: "ProductRequests");

            migrationBuilder.DropForeignKey(
                name: "FK_ProductRequests_Users_FarmerId",
                table: "ProductRequests");

            migrationBuilder.DropIndex(
                name: "IX_ProductRequests_AgrochemicalId",
                table: "ProductRequests");

            migrationBuilder.DropIndex(
                name: "IX_ProductRequests_FarmerId",
                table: "ProductRequests");

            migrationBuilder.DropIndex(
                name: "IX_Feedbacks_UserId",
                table: "Feedbacks");

            migrationBuilder.DropIndex(
                name: "IX_Crops_FarmerId",
                table: "Crops");

            migrationBuilder.DropIndex(
                name: "IX_Agrochemicals_SellerId",
                table: "Agrochemicals");
        }
    }
}
