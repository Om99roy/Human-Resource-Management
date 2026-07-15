import sys, base64, json

def decode(tok):
    parts = tok.split('.')
    if len(parts) < 2:
        print('invalid')
        return
    payload = parts[1]
    padding = '=' * (-len(payload) % 4)
    data = base64.urlsafe_b64decode(payload + padding)
    print(json.dumps(json.loads(data), indent=2))


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print('usage: decode_jwt.py <token>')
    else:
        decode(sys.argv[1])
