import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import socket
import threading
import webbrowser


class PreviewServer(ThreadingHTTPServer):
    allow_reuse_address = False

    def server_bind(self):
        if hasattr(socket, "SO_EXCLUSIVEADDRUSE"):
            self.socket.setsockopt(socket.SOL_SOCKET, socket.SO_EXCLUSIVEADDRUSE, 1)
        super().server_bind()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("port", type=int, nargs="?", default=4173)
    parser.add_argument("--no-browser", action="store_true")
    args = parser.parse_args()
    if not 1 <= args.port <= 65535:
        parser.error("port must be between 1 and 65535")

    directory = Path(__file__).resolve().parent / "prototype"
    if not (directory / "index.html").is_file():
        parser.error("prototype/index.html is missing")
    handler = partial(SimpleHTTPRequestHandler, directory=str(directory))
    for port in range(args.port, min(args.port + 10, 65536)):
        try:
            server = PreviewServer(("127.0.0.1", port), handler)
            break
        except OSError as error:
            if getattr(error, "winerror", error.errno) not in (98, 10048, 10013):
                raise
    else:
        parser.error("no available local port; try start-preview.cmd 4185")

    with server:
        url = f"http://127.0.0.1:{port}/"
        print(f"Preview URL: {url}", flush=True)
        print("Keep this window open. Press Ctrl+C to stop.", flush=True)
        if not args.no_browser:
            threading.Thread(target=webbrowser.open, args=(url,), daemon=True).start()
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            pass


if __name__ == "__main__":
    main()
