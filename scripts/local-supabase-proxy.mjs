import net from "node:net";

const bindAddress = process.argv[2];
const port = Number(process.argv[3]);

if (!net.isIP(bindAddress) || !Number.isInteger(port) || port < 1 || port > 65535) {
  console.error("Usage: node scripts/local-supabase-proxy.mjs <Mac LAN IP> <Supabase API port>");
  process.exit(2);
}

const server = net.createServer((client) => {
  const upstream = net.connect({ host: "127.0.0.1", port });
  client.pipe(upstream);
  upstream.pipe(client);
  client.on("error", () => upstream.destroy());
  upstream.on("error", () => client.destroy());
  client.on("close", () => upstream.destroy());
  upstream.on("close", () => client.destroy());
});

server.listen(port, bindAddress, () => {
  console.log(`Supabase LAN proxy listening on ${bindAddress}:${port}`);
});
