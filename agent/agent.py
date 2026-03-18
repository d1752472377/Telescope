import shutil
import subprocess
import sys
from tkinter import Tk, messagebox
from urllib.parse import parse_qs, urlparse


def show_error(message: str) -> None:
    root = Tk()
    root.withdraw()
    messagebox.showerror('Telescope Agent', message)
    root.destroy()


def get_param(params: dict[str, list[str]], key: str, default: str = '') -> str:
    return params.get(key, [default])[0]


def launch_command(command: list[str]) -> None:
    subprocess.Popen(command)


def try_launch(commands: list[list[str]]) -> bool:
    for command in commands:
        executable = command[0]
        if shutil.which(executable) or executable.lower().endswith('.exe'):
            try:
                launch_command(command)
                return True
            except OSError:
                continue
    return False


def handle_ssh(host: str, port: str, user: str) -> None:
    if not host or not user:
        show_error('SSH requires host and user parameters.')
        return

    commands = [
        ['Xshell.exe', f'{user}@{host}', '-P', port or '22'],
        ['Termius.exe', 'ssh', f'{user}@{host}', '-p', port or '22'],
        ['wt.exe', 'ssh', f'{user}@{host}', '-p', port or '22'],
        ['ssh', f'{user}@{host}', '-p', port or '22'],
    ]

    if not try_launch(commands):
        show_error('No supported SSH client was found. Tried Xshell, Termius, and Windows Terminal.')


def handle_ftp(host: str, port: str, user: str) -> None:
    if not host:
        show_error('FTP requires a host parameter.')
        return

    address = f'ftp://{host}'
    if port:
        address = f'{address}:{port}'
    if user:
        address = f'ftp://{user}@{host}' + (f':{port}' if port else '')

    commands = [
        ['filezilla.exe', address],
        ['FileZilla.exe', address],
    ]

    if not try_launch(commands):
        show_error('FileZilla was not found. Please install it or adjust the agent logic for your preferred FTP client.')


def handle_rdp(host: str, port: str) -> None:
    if not host:
        show_error('RDP requires a host parameter.')
        return

    target = host if not port else f'{host}:{port}'
    try:
        launch_command(['mstsc', f'/v:{target}'])
    except OSError:
        show_error('Remote Desktop client is unavailable on this machine.')


def main() -> None:
    if len(sys.argv) < 2:
        show_error('No telescope URL was provided to the agent.')
        return

    parsed = urlparse(sys.argv[1])
    action = parsed.netloc or parsed.path.lstrip('/')
    params = parse_qs(parsed.query)

    if action != 'connect':
        show_error('Unsupported action. Expected telescope://connect?...')
        return

    protocol = get_param(params, 'protocol').lower()
    host = get_param(params, 'host')
    port = get_param(params, 'port')
    user = get_param(params, 'user')

    if protocol == 'ssh':
        handle_ssh(host, port, user)
    elif protocol == 'ftp':
        handle_ftp(host, port, user)
    elif protocol == 'rdp':
        handle_rdp(host, port)
    else:
        show_error('Unsupported protocol. Use ssh, ftp, or rdp.')


if __name__ == '__main__':
    main()
