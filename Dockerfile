# ── Build stage ──────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY *.csproj ./
RUN dotnet restore

COPY . ./
RUN dotnet publish -c Release -o /app/publish

# ── Runtime stage ─────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

COPY --from=build /app/publish .

# Shell-form CMD so $PORT is expanded at container runtime (not build time).
# Render injects PORT; we bind to 0.0.0.0 so the port is reachable externally.
CMD dotnet StudySphere.dll --urls "http://0.0.0.0:${PORT:-5000}"
