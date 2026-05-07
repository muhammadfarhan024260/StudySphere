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

# Render sets PORT dynamically; ASP.NET Core reads ASPNETCORE_URLS
ENV ASPNETCORE_URLS=http://+:$PORT

ENTRYPOINT ["dotnet", "StudySphere.dll"]
