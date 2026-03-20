function readEnv(name: string, fallback = ""): string {
  return process.env[name] ?? fallback;
}

function readHostEnv(hostEnvName: string, fallbackHost: string, fallbackPort: number) {
  const rawHost = readEnv(hostEnvName, `${fallbackHost}:${fallbackPort}`);
  const [hostFromEnv, portFromHost] = rawHost.includes(":") ? rawHost.split(":") : [rawHost, ""];
  const port = portFromHost ? Number(portFromHost) : fallbackPort;

  return {
    host: hostFromEnv || fallbackHost,
    port: Number.isFinite(port) ? port : fallbackPort
  };
}

const postgres = readHostEnv("AIBOT_POSTGRES_HOST", "127.0.0.1", 5432);

export const env = {
  postgresHost: postgres.host,
  postgresPort: postgres.port,
  postgresDatabase: readEnv("AIBOT_POSTGRES_DATABASE", "lumi_game_bot"),
  postgresUser: readEnv("AIBOT_POSTGRES_USER", "postgres"),
  postgresPassword: readEnv("AIBOT_POSTGRES_PASSWORD", ""),
  postgresSchema: readEnv("AIBOT_POSTGRES_SCHEMA", "public")
};
