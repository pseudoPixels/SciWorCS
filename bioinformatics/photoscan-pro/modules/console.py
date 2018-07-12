import sys
import PhotoScan

def append_console(context, text, text_type):
    for line in text.split('\n'):
        context.append(line.replace('\t', '    ') + "\n", text_type)


def get_console(context):
    from code import InteractiveConsole

    if context.console is None:
        namespace = {}

        namespace["__builtins__"] = sys.modules["builtins"]
        namespace["PhotoScan"] = PhotoScan

        context.console = InteractiveConsole(locals=namespace, filename="<console>")

    return context.console


def expand(line, cursor, namespace):
    import os
    import rlcompleter
    import inspect

    if line[:cursor].strip().endswith('('):

        scrollback = ''

        func_word = line[:cursor].split()[-1][:-1]

        try:
            func = eval(func_word, namespace)
        except Exception:
            func = None

        if func:
            scrollback = inspect.getdoc(func)

    else:
        word = line[:cursor].rpartition(' ')[2]

        matches = []

        if word:
            completer = rlcompleter.Completer(namespace)
            completer.complete(word, 0)
            matches = sorted(set(completer.matches))

        matches = [match for match in matches if not('._' in match)]

        if len(matches) == 1:
            scrollback = ''
        else:
            scrollback = '  '.join([m.split('.')[-1] for m in matches])

        prefix = os.path.commonprefix(matches)[len(word):]
        if prefix:
            line = line[:cursor] + prefix + line[cursor:]
            cursor += len(prefix)
            if prefix.endswith('('):
                return expand(line, cursor, namespace)

    return line, cursor, scrollback


def execute(context):
    import io

    stdin_backup = sys.stdin
    sys.stdin = None

    line = ""
    is_multiline = False

    line = context.command

    try:
        line_exec = line if line.strip() else "\n"

        is_multiline = get_console(context).push(line_exec)
    except:
        import traceback
        stderr.write(traceback.format_exc())

    sys.last_traceback = None

    context.append(context.prompt + line + "\n", 'INPUT')

    if is_multiline:
        context.prompt = '... '
    else:
        context.prompt = '>>> '

    context.cursor = 0
    context.command = ""

    sys.stdin = stdin_backup

    return True


def autocomplete(context):

    stdin_backup = sys.stdin
    sys.stdin = None

    scrollback = ""
    scrollback_error = ""

    try:
        context.command, context.cursor, scrollback = expand(context.command, context.cursor, get_console(context).locals)
    except:
        import traceback
        scrollback_error = traceback.format_exc()

    if scrollback != '':
        context.append(context.prompt + context.command + "\n", 'INPUT')

    if scrollback:
        append_console(context, scrollback, 'INFO')

    if scrollback_error:
        append_console(context, scrollback_error, 'ERROR')

    sys.stdin = stdin_backup

    return True


def init(context):
    context.prompt = '>>> '

    return True
