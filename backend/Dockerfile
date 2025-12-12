# syntax=docker/dockerfile:1

ARG DOTNET_VERSION=8.0

FROM mcr.microsoft.com/dotnet/sdk:${DOTNET_VERSION} AS build
WORKDIR /src

ARG SERVICE_PROJECT
ARG SERVICE_DLL

COPY backend/global.json backend/Directory.Build.props backend/Directory.Packages.props backend/LogisticsSafetyPlatform.Backend.sln ./backend/

# Copy project files (restore layer)
COPY backend/src/Shared.Contracts/Shared.Contracts.csproj ./backend/src/Shared.Contracts/
COPY backend/src/Shared.ServiceDefaults/Shared.ServiceDefaults.csproj ./backend/src/Shared.ServiceDefaults/

COPY backend/src/AuthService/AuthService.csproj ./backend/src/AuthService/
COPY backend/src/UserService/UserService.csproj ./backend/src/UserService/
COPY backend/src/DriverService/DriverService.csproj ./backend/src/DriverService/
COPY backend/src/VehicleService/VehicleService.csproj ./backend/src/VehicleService/
COPY backend/src/OrderService/OrderService.csproj ./backend/src/OrderService/
COPY backend/src/DictionaryService/DictionaryService.csproj ./backend/src/DictionaryService/
COPY backend/src/Gateway/Gateway.csproj ./backend/src/Gateway/

RUN dotnet restore ./backend/LogisticsSafetyPlatform.Backend.sln

# Copy source
COPY backend ./backend

RUN dotnet publish ./backend/${SERVICE_PROJECT} -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:${DOTNET_VERSION} AS final
WORKDIR /app

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

COPY --from=build /app/publish .

ENV SERVICE_DLL=${SERVICE_DLL}
ENTRYPOINT ["sh", "-c", "dotnet $SERVICE_DLL"]
