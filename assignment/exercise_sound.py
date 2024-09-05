import network
import socket
import machine
import utime
import uos
from machine import Pin, PWM

# WiFi credentials
SSID = 'Your_WiFi_SSID'
PASSWORD = 'Your_WiFi_Password'

# Speaker setup
SPEAKER_PIN = 16
speaker = PWM(Pin(SPEAKER_PIN))

def connect_wifi():
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)
    if not wlan.isconnected():
        print('Connecting to WiFi...')
        wlan.connect(SSID, PASSWORD)
        while not wlan.isconnected():
            pass
    print('WiFi connected, IP:', wlan.ifconfig()[0])
    return wlan

def play_audio(filename):
    try:
        with open(filename, 'rb') as file:
            # Assume the file is raw PCM audio data
            # You may need to adjust this based on your audio format
            while True:
                chunk = file.read(1024)  # Read 1KB at a time
                if not chunk:
                    break
                for byte in chunk:
                    speaker.duty_u16(int(byte) * 256)  # Scale 8-bit audio to 16-bit
                    utime.sleep_us(125)  # Adjust this for your desired sample rate
    except Exception as e:
        print("Error playing audio:", e)
    finally:
        speaker.duty_u16(0)  # Turn off the speaker

def handle_request(client):
    request = client.recv(1024)
    if request.startswith(b'POST /upload'):
        print("Receiving file...")
        # Find the start of the file data
        file_start = request.find(b'\r\n\r\n') + 4
        file_data = request[file_start:]
        
        # Save the file
        with open('received_audio.raw', 'wb') as file:
            file.write(file_data)
        
        # Send response
        response = 'HTTP/1.0 200 OK\r\nContent-Type: text/plain\r\n\r\nFile uploaded successfully'
        client.send(response.encode())
        
        # Play the received audio
        play_audio('received_audio.raw')
    else:
        response = 'HTTP/1.0 400 Bad Request\r\nContent-Type: text/plain\r\n\r\nInvalid request'
        client.send(response.encode())
    client.close()

def start_server():
    addr = socket.getaddrinfo('0.0.0.0', 80)[0][-1]
    s = socket.socket()
    s.bind(addr)
    s.listen(1)
    print('Listening on', addr)
    while True:
        try:
            client, addr = s.accept()
            print('Client connected from', addr)
            handle_request(client)
        except Exception as e:
            print("Server error:", e)

# Main execution
connect_wifi()
start_server()