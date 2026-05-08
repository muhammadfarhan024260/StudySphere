using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace StudySphere.Migrations
{
    /// <inheritdoc />
    public partial class AddDepartmentAndSemesterTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "admin",
                columns: table => new
                {
                    admin_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    email = table.Column<string>(type: "text", nullable: false),
                    password_hash = table.Column<string>(type: "text", nullable: false),
                    name = table.Column<string>(type: "text", nullable: false),
                    created_date = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    last_login = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_admin", x => x.admin_id);
                });

            migrationBuilder.CreateTable(
                name: "department",
                columns: table => new
                {
                    department_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    name = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_department", x => x.department_id);
                });

            migrationBuilder.CreateTable(
                name: "goal",
                columns: table => new
                {
                    goal_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    student_id = table.Column<int>(type: "integer", nullable: false),
                    subject_id = table.Column<int>(type: "integer", nullable: false),
                    goal_type = table.Column<string>(type: "text", nullable: false),
                    target_hours = table.Column<decimal>(type: "numeric", nullable: false),
                    deadline = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    is_completed = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_goal", x => x.goal_id);
                });

            migrationBuilder.CreateTable(
                name: "notification",
                columns: table => new
                {
                    notification_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    student_id = table.Column<int>(type: "integer", nullable: false),
                    related_subject_id = table.Column<int>(type: "integer", nullable: true),
                    type = table.Column<string>(type: "text", nullable: false),
                    message = table.Column<string>(type: "text", nullable: false),
                    is_read = table.Column<bool>(type: "boolean", nullable: false),
                    created_date = table.Column<DateTime>(type: "timestamp without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_notification", x => x.notification_id);
                });

            migrationBuilder.CreateTable(
                name: "otp_verification",
                columns: table => new
                {
                    otp_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    email = table.Column<string>(type: "text", nullable: false),
                    otp_code = table.Column<string>(type: "text", nullable: false),
                    user_type = table.Column<string>(type: "text", nullable: false),
                    is_verified = table.Column<bool>(type: "boolean", nullable: false),
                    created_date = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    expiry_time = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    verification_date = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    attempt_count = table.Column<int>(type: "integer", nullable: false),
                    is_used = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_otp_verification", x => x.otp_id);
                });

            migrationBuilder.CreateTable(
                name: "recommendation",
                columns: table => new
                {
                    recommendation_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    subject_id = table.Column<int>(type: "integer", nullable: false),
                    admin_id = table.Column<int>(type: "integer", nullable: false),
                    title = table.Column<string>(type: "text", nullable: false),
                    content = table.Column<string>(type: "text", nullable: false),
                    min_score_threshold = table.Column<int>(type: "integer", nullable: false),
                    created_date = table.Column<DateTime>(type: "timestamp without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_recommendation", x => x.recommendation_id);
                });

            migrationBuilder.CreateTable(
                name: "semester_option",
                columns: table => new
                {
                    semester_option_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    name = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_semester_option", x => x.semester_option_id);
                });

            migrationBuilder.CreateTable(
                name: "student",
                columns: table => new
                {
                    student_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    email = table.Column<string>(type: "text", nullable: false),
                    password_hash = table.Column<string>(type: "text", nullable: false),
                    name = table.Column<string>(type: "text", nullable: false),
                    enrollment_number = table.Column<string>(type: "text", nullable: false),
                    phone = table.Column<string>(type: "text", nullable: false),
                    department = table.Column<string>(type: "text", nullable: false),
                    semester = table.Column<string>(type: "text", nullable: false),
                    created_date = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    last_login = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_student", x => x.student_id);
                });

            migrationBuilder.CreateTable(
                name: "study_log",
                columns: table => new
                {
                    log_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    student_id = table.Column<int>(type: "integer", nullable: false),
                    subject_id = table.Column<int>(type: "integer", nullable: false),
                    hours_studied = table.Column<decimal>(type: "numeric", nullable: false),
                    productivity_score = table.Column<int>(type: "integer", nullable: false),
                    date_logged = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    notes = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_study_log", x => x.log_id);
                });

            migrationBuilder.CreateTable(
                name: "subject",
                columns: table => new
                {
                    subject_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    name = table.Column<string>(type: "text", nullable: false),
                    category = table.Column<string>(type: "text", nullable: true),
                    target_hours = table.Column<decimal>(type: "numeric", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_subject", x => x.subject_id);
                });

            migrationBuilder.CreateTable(
                name: "weak_area",
                columns: table => new
                {
                    weak_area_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    student_id = table.Column<int>(type: "integer", nullable: false),
                    subject_id = table.Column<int>(type: "integer", nullable: false),
                    avg_score = table.Column<decimal>(type: "numeric", nullable: false),
                    detected_date = table.Column<DateTime>(type: "timestamp without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_weak_area", x => x.weak_area_id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_admin_email",
                table: "admin",
                column: "email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_department_name",
                table: "department",
                column: "name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_otp_verification_email_user_type",
                table: "otp_verification",
                columns: new[] { "email", "user_type" });

            migrationBuilder.CreateIndex(
                name: "IX_semester_option_name",
                table: "semester_option",
                column: "name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_student_email",
                table: "student",
                column: "email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "admin");

            migrationBuilder.DropTable(
                name: "department");

            migrationBuilder.DropTable(
                name: "goal");

            migrationBuilder.DropTable(
                name: "notification");

            migrationBuilder.DropTable(
                name: "otp_verification");

            migrationBuilder.DropTable(
                name: "recommendation");

            migrationBuilder.DropTable(
                name: "semester_option");

            migrationBuilder.DropTable(
                name: "student");

            migrationBuilder.DropTable(
                name: "study_log");

            migrationBuilder.DropTable(
                name: "subject");

            migrationBuilder.DropTable(
                name: "weak_area");
        }
    }
}
