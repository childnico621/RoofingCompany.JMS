FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /app
COPY . ./
RUN dotnet restore "src/Api/Api.csproj"
RUN dotnet publish "src/Api/Api.csproj" -c Release -o out

FROM base AS final
RUN useradd -m jobappuser
WORKDIR /app
COPY --from=build /app/out ./
RUN chown -R jobappuser:jobappuser /app
USER jobappuser
ENTRYPOINT ["dotnet", "Api.dll"]
