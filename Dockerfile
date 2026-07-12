FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src/DayhomeFlowApi

COPY DayhomeFlowApi/*.csproj ./
RUN dotnet restore

COPY DayhomeFlowApi/. ./
RUN dotnet publish -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends libgssapi-krb5-2 \
    && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/publish .

EXPOSE 8080

ENTRYPOINT ["dotnet", "DayhomeFlowApi.dll"]