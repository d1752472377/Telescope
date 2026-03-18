import sys
from pathlib import Path
import winreg
from tkinter import Tk, messagebox

PROTOCOL_NAME = 'telescope'
AGENT_PATH = Path(__file__).with_name('agent.py')
COMMAND = f'"{sys.executable}" "{AGENT_PATH}" "%1"'


def show_message(title: str, message: str) -> None:
    root = Tk()
    root.withdraw()
    messagebox.showinfo(title, message)
    root.destroy()


def register() -> None:
    try:
        with winreg.CreateKey(winreg.HKEY_CURRENT_USER, rf'Software\\Classes\\{PROTOCOL_NAME}') as key:
            winreg.SetValueEx(key, '', 0, winreg.REG_SZ, 'URL:Telescope Protocol')
            winreg.SetValueEx(key, 'URL Protocol', 0, winreg.REG_SZ, '')

        with winreg.CreateKey(
            winreg.HKEY_CURRENT_USER,
            rf'Software\\Classes\\{PROTOCOL_NAME}\\shell\\open\\command',
        ) as key:
            winreg.SetValueEx(key, '', 0, winreg.REG_SZ, COMMAND)

        show_message('Telescope Agent', 'Protocol registered successfully under HKCU.')
    except OSError as exc:
        show_message(
            'Telescope Agent',
            f'Failed to register the protocol. Check your permissions or environment.\n\n{exc}',
        )


def unregister() -> None:
    try:
        winreg.DeleteKey(winreg.HKEY_CURRENT_USER, rf'Software\\Classes\\{PROTOCOL_NAME}\\shell\\open\\command')
        winreg.DeleteKey(winreg.HKEY_CURRENT_USER, rf'Software\\Classes\\{PROTOCOL_NAME}\\shell\\open')
        winreg.DeleteKey(winreg.HKEY_CURRENT_USER, rf'Software\\Classes\\{PROTOCOL_NAME}\\shell')
        winreg.DeleteKey(winreg.HKEY_CURRENT_USER, rf'Software\\Classes\\{PROTOCOL_NAME}')
        show_message('Telescope Agent', 'Protocol unregistered successfully.')
    except FileNotFoundError:
        show_message('Telescope Agent', 'Protocol registration was not found.')
    except OSError as exc:
        show_message(
            'Telescope Agent',
            f'Failed to unregister the protocol. Check your permissions or environment.\n\n{exc}',
        )


if __name__ == '__main__':
    if len(sys.argv) > 1 and sys.argv[1] == '--unregister':
        unregister()
    else:
        register()
