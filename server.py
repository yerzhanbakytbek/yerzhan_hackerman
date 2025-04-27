from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import requests
import re
import socket
from urllib.parse import urlparse
import aiohttp
import asyncio
import logging
from datetime import datetime

app = Flask(__name__)
CORS(app)

# API ключтері
SHODAN_API_KEY = '0AU7CEgd89QiIYQUlouI4dwU1bWoMWsq'
VIRUSTOTAL_API_KEY = '897ae61e98e5dd2ffaa3a23976aec52b0d0bb2f01a04d3583955686de9ff6719'
GEMINI_API_KEY = 'AIzaSyA7feCQnxaRmPgnztD5b7J3ppJWQ7IWDYE'
URLSCAN_API_KEY = '0195baa8-39a8-788f-978c-9251fd651867'

# Логгер конфигурациясы
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('server.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Gemini конфигурациясы
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel("models/gemini-1.5-pro")

def log_request(ip_or_domain, response):
    """Сұраныстарды логтау"""
    with open("requests.log", "a", encoding="utf-8") as f:
        f.write(f"⏰ {datetime.now()}\n🔹 Сұраныс: {ip_or_domain}\n🔸 Жауап: {response}\n{'-'*40}\n")

def is_ip_address(text):
    """IP мекенжайын тексеру"""
    pattern = r"^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$"
    return bool(re.match(pattern, text.strip()))

def is_domain(text):
    """Доменді тексеру"""
    pattern = r"^(?!-)[A-Za-z0-9-]{1,63}(?:\.[A-Za-z]{2,})+$"
    return bool(re.match(pattern, text.strip()))

def is_url(text):
    """URL мекенжайын тексеру"""
    pattern = r"^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/.*)?$"
    return bool(re.match(pattern, text.strip()))

def get_ip_from_domain(domain):
    """Доменнен IP мекенжайын алу"""
    try:
        ip = socket.gethostbyname(domain)
        return ip
    except Exception as e:
        logger.error(f"IP алу қатесі {domain}: {str(e)}")
        return "IP мекенжайын анықтау мүмкін болмады"

def get_shodan_data(ip):
    """Shodan-нан мәліметтерді алу"""
    try:
        url = f"https://api.shodan.io/shodan/host/{ip}?key={SHODAN_API_KEY}"
        response = requests.get(url)
        if response.status_code == 200:
            data = response.json()
            ports = ", ".join(str(port) for port in data.get("ports", []))
            os = data.get("os", "Анықталмады")
            return f"Shodan деректері: Ашық порттар - {ports}; ОС - {os}"
    except Exception as e:
        logger.error(f"Shodan қатесі {ip}: {str(e)}")
    return "Shodan деректері қолжетімді емес"

def get_virustotal_data(ip_or_domain):
    """VirusTotal-дан мәліметтерді алу"""
    try:
        url = f"https://www.virustotal.com/api/v3/{'domains' if not is_ip_address(ip_or_domain) else 'ip_addresses'}/{ip_or_domain}"
        headers = {"x-apikey": VIRUSTOTAL_API_KEY}
        response = requests.get(url, headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            stats = data['data']['attributes']['last_analysis_stats']
            return f"VirusTotal деректері: Зиянды - {stats['malicious']}, Күдікті - {stats['suspicious']}, Анықталмаған - {stats['undetected']}"
        elif response.status_code == 429:
            logger.warning(f"VirusTotal квота шегіне жетті: {ip_or_domain}")
            return "VirusTotal деректері қолжетімді емес: Квота таусылды"
    except Exception as e:
        logger.error(f"VirusTotal қатесі {ip_or_domain}: {str(e)}")
    return "VirusTotal деректері қолжетімді емес"

def get_whois_data(ip_or_domain):
    """WHOIS мәліметтерін алу"""
    try:
        response = requests.get(f"http://ip-api.com/json/{ip_or_domain}")
        if response.status_code == 200:
            data = response.json()
            return f"WHOIS: Ел - {data.get('country', 'Белгісіз')}, ISP - {data.get('isp', 'Белгісіз')}"
        elif response.status_code == 429:
            logger.warning(f"WHOIS квота шегіне жетті: {ip_or_domain}")
            return "WHOIS деректері қолжетімді емес: Квота таусылды"
    except Exception as e:
        logger.error(f"WHOIS қатесі {ip_or_domain}: {str(e)}")
    return "WHOIS деректері қолжетімді емес"

@app.route('/api/chat', methods=['POST'])
def chat():
    """Чат сұраныстарын өңдеу"""
    try:
        data = request.json
        text = data.get('message', '').strip()
        
        if not text:
            return jsonify({'error': 'Хабарлама бос болмауы керек'}), 400

        logger.info(f"Жаңа сұраныс алынды: {text}")

        if is_ip_address(text):
            ip = text
            shodan_data = get_shodan_data(ip)
            vt_data = get_virustotal_data(ip)
            whois_data = get_whois_data(ip)
            full_data = f"{shodan_data}\n{vt_data}\n{whois_data}"
            prompt = f"{ip} IP мекенжайы туралы келесі деректерді қазақ тілінде түсіндір және қандай әрекеттер жасауға болатыны туралы кеңестер бер: {full_data}"
        
        elif is_url(text):
            parsed_url = urlparse(text)
            domain = parsed_url.netloc
            ip = get_ip_from_domain(domain)
            shodan_data = get_shodan_data(ip)
            vt_data = get_virustotal_data(domain)
            whois_data = get_whois_data(domain)
            full_data = f"IP: {ip}\n{shodan_data}\n{vt_data}\n{whois_data}"
            prompt = f"{text} URL мекенжайы туралы келесі деректерді қазақ тілінде түсіндір және фишингтік сайт екенін тексеріп, қандай әрекеттер жасауға болатыны туралы кеңестер бер: {full_data}"
        
        elif is_domain(text):
            domain = text
            ip = get_ip_from_domain(domain)
            shodan_data = get_shodan_data(ip)
            vt_data = get_virustotal_data(domain)
            whois_data = get_whois_data(domain)
            full_data = f"IP: {ip}\n{shodan_data}\n{vt_data}\n{whois_data}"
            prompt = f"{domain} домені туралы келесі деректерді қазақ тілінде түсіндір және қандай әрекеттер жасауға болатыны туралы кеңестер бер: {full_data}"
        
        else:
            return jsonify({'error': 'Жарамсыз формат. IP мекенжайын, доменді немесе URL енгізіңіз'}), 400

        try:
            response = model.generate_content([prompt])
            log_request(text, response.text)
            return jsonify({'response': response.text})
        except Exception as e:
            logger.error(f"Gemini қатесі: {str(e)}")
            return jsonify({'error': 'AI жауап бере алмады'}), 500

    except Exception as e:
        logger.error(f"Жалпы қате: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5500) 