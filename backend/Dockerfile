FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /app

# Copy all files
COPY . ./
# Restore as distinct layers
RUN dotnet restore "src/Api/Api.csproj"
# Build and publish a release
RUN dotnet publish "src/Api/Api.csproj" -c Release -o out

# Build runtime image
FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build /app/out .
EXPOSE 8080
ENTRYPOINT ["dotnet", "Api.dll"]
