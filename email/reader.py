import ssl
from imapclient import IMAPClient
import pyzmail

HOST = "imap.gmail.com"
USERNAME = "soumyanagarkar29@gmail.com"
PASSWORD = "xmredazovmqcnoiu"

def read_latest():
    # Force modern TLS for providers like Gmail (TLS 1.2+).
    ssl_context = ssl.create_default_context()
    ssl_context.minimum_version = ssl.TLSVersion.TLSv1_2
    server = IMAPClient(HOST, ssl=True, ssl_context=ssl_context)
    server.login(USERNAME, PASSWORD)
    server.select_folder("INBOX")

    # 'ALL' is required by many IMAP servers to return all UIDs
    msg = server.search(['ALL'])

    if len(msg) == 0:
        server.logout()
        return None, None
    
    # We use a single 'else' block for when emails ARE found
    else:
        last_uid = msg[-1]
        raw_text_content = server.fetch([last_uid], ["BODY[]"])

        text_content = pyzmail.PyzMessage.factory(
            raw_text_content[last_uid][b"BODY[]"]
        )

        subject = text_content.get_subject()

        # Check if text_part exists (Plain Text). If not, try html_part.
        if text_content.text_part is not None:
            charset = text_content.text_part.charset or 'utf-8'
            body = text_content.text_part.get_payload().decode(charset)
        elif text_content.html_part is not None:
            charset = text_content.html_part.charset or 'utf-8'
            body = text_content.html_part.get_payload().decode(charset)
        else:
            body = "[No readable text or HTML content]"

        server.logout()
        return subject, body

# This part runs when you execute reader.py directly
if __name__ == "__main__":
    subject, body = read_latest()
    print(f"Subject: {subject}")
    print(f"Body: {body}")
