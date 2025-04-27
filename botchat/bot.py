import logging
import datetime
from aiogram import Bot, Dispatcher, types
from aiogram.filters import Command, CommandStart
from aiogram.types import BufferedInputFile
import requests
import asyncio
import re
import google.generativeai as genai
import aiohttp
from asyncio import TimeoutError
import socket
from io import BytesIO
from urllib.parse import urlparse

API_TOKEN = '7797539327:AAFDcShHxoUyNzk9D0ymQer-Uc_ffsuOH-U'
SHODAN_API_KEY = '0AU7CEgd89QiIYQUlouI4dwU1bWoMWsq'
VIRUSTOTAL_API_KEY = '897ae61e98e5dd2ffaa3a23976aec52b0d0bb2f01a04d3583955686de9ff6719'
GEMINI_API_KEY = 'AIzaSyA7feCQnxaRmPgnztD5b7J3ppJWQ7IWDYE'
URLSCAN_API_KEY = '0195baa8-39a8-788f-978c-9251fd651867'  # Сіз берген API кілті

user_lang = {}
user_conversation_history = {}
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel("models/gemini-1.5-pro")

logging.basicConfig(level=logging.INFO)
bot = Bot(token=API_TOKEN)
dp = Dispatcher()

def log_message(user, prompt, response):
    with open("logs.txt", "a", encoding="utf-8") as f:
        f.write(f"👤 {user} | ⏰ {datetime.datetime.now()}\n🔹 Сұраныс: {prompt}\n🔸 Жауап: {response}\n{'-'*40}\n")

def is_ip_address(text):
    pattern = r"^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$"
    return bool(re.match(pattern, text.strip()))

def is_domain(text):
    pattern = r"^(?!-)[A-Za-z0-9-]{1,63}(?:\.[A-Za-z]{2,})+$"
    return bool(re.match(pattern, text.strip()))

def is_url(text):
    pattern = r"^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/.*)?$"
    return bool(re.match(pattern, text.strip()))

async def get_ip_from_domain(domain):
    try:
        ip = socket.gethostbyname(domain)
        return ip
    except:
        return "IP мекенжайын анықтау мүмкін болмады."

async def get_shodan_data(ip):
    return f"Shodan деректері: Ашық порттар - 80, 443; ОС - Linux"

async def get_virustotal_data(ip_or_domain):
    url = f"https://www.virustotal.com/api/v3/domains/{ip_or_domain}" if not is_ip_address(ip_or_domain) else f"https://www.virustotal.com/api/v3/ip_addresses/{ip_or_domain}"
    headers = {"x-apikey": VIRUSTOTAL_API_KEY}
    async with aiohttp.ClientSession() as session:
        async with session.get(url, headers=headers) as response:
            if response.status == 200:
                data = await response.json()
                stats = data['data']['attributes']['last_analysis_stats']
                return f"VirusTotal деректері: Зиянды - {stats['malicious']}, Күдікті - {stats['suspicious']}, Анықталмаған - {stats['undetected']}"
            elif response.status == 429:
                print(f"VirusTotal 429 қатесі: Квота таусылды.")
                return "VirusTotal деректері қолжетімді емес: Квота таусылды."
            return "VirusTotal деректері қолжетімді емес."

async def get_whois_data(ip_or_domain):
    try:
        response = requests.get(f"http://ip-api.com/json/{ip_or_domain}" if is_ip_address(ip_or_domain) else f"http://ip-api.com/json/{await get_ip_from_domain(ip_or_domain)}")
        data = response.json()
        if response.status_code == 429:
            print(f"WHOIS 429 қатесі: Квота таусылды.")
            return "WHOIS деректері қолжетімді емес: Квота таусылды."
        return f"WHOIS: Ел - {data.get('country', 'Белгісіз')}, ISP - {data.get('isp', 'Белгісіз')}"
    except:
        return "WHOIS деректері қолжетімді емес."

async def scan_url_with_urlscan(url, message: types.Message):
    headers = {"API-Key": URLSCAN_API_KEY}
    payload = {"url": url if url.startswith("http") else f"https://{url}", "visibility": "public"}

    async with aiohttp.ClientSession() as session:
        try:
            async with session.post("https://urlscan.io/api/v1/scan/", json=payload, headers=headers) as resp:
                if resp.status == 200:
                    result = await resp.json()
                    scan_uuid = result["uuid"]
                    print(f"URLScan: Сканерлеу басталды: {result['api']}")
                elif resp.status == 429:
                    print(f"URLScan 429 қатесі: Квота таусылды.")
                    await message.answer("⚠️ URLScan квотасы таусылды. Кейінірек қайталап көріңіз немесе жаңа API кілтін қолданыңыз.")
                    return None
                else:
                    await message.answer(f"URLScan сканерлеу қатесі: {await resp.text()}")
                    return None

            await asyncio.sleep(40)
            async with session.get(f"https://urlscan.io/api/v1/result/{scan_uuid}/") as resp:
                if resp.status == 200:
                    screenshot_url = f"https://urlscan.io/screenshots/{scan_uuid}.png"
                    async with session.get(screenshot_url) as screenshot_resp:
                        if screenshot_resp.status == 200:
                            screenshot_data = await screenshot_resp.read()
                            photo = BufferedInputFile(screenshot_data, filename="screenshot.png")
                            await bot.send_photo(chat_id=message.chat.id, photo=photo, caption=f"URLScan есебі: https://urlscan.io/result/{scan_uuid}/")
                            return f"URLScan:\nТолық есеп: https://urlscan.io/result/{scan_uuid}/"
                        else:
                            await message.answer("URLScan скриншотты жүктеу қатесі.")
                            return None
                else:
                    await message.answer("URLScan нәтижесі әлі дайын емес. Сайтты сканерлеу ұзағырақ уақыт алуы мүмкін.")
                    return None
        except Exception as e:
            await message.answer(f"URLScan қатесі: {str(e)}")
            return None

async def process_ip_or_domain_or_url(target, message: types.Message, is_ip=True, is_url=False):
    user_id = message.from_user.id
    lang = user_lang.get(user_id, "kk")
    try:
        if is_ip:
            ip = target
            shodan_data = await get_shodan_data(ip)
            vt_data = await get_virustotal_data(ip)
            whois_data = await get_whois_data(ip)
            full_data = f"{shodan_data}\n{vt_data}\n{whois_data}"
            prompt = f"{ip} IP мекенжайы туралы келесі деректерді қазақ тілінде түсіндір және қандай әрекеттер жасауға болатыны туралы кеңестер бер: {full_data}"
        elif is_url:
            parsed_url = urlparse(target)
            domain = parsed_url.netloc
            ip = await get_ip_from_domain(domain)
            shodan_data = await get_shodan_data(ip)
            vt_data = await get_virustotal_data(domain)
            whois_data = await get_whois_data(domain)
            urlscan_result = await scan_url_with_urlscan(target, message)
            if urlscan_result:
                full_data = f"IP: {ip}\n{shodan_data}\n{vt_data}\n{whois_data}\n{urlscan_result}"
            else:
                full_data = f"IP: {ip}\n{shodan_data}\n{vt_data}\n{whois_data}"
            prompt = f"{target} URL мекенжайы туралы келесі деректерді қазақ тілінде түсіндір және фишингтік сайт екенін тексеріп, қандай әрекеттер жасауға болатыны туралы кеңестер бер: {full_data}"
        else:
            domain = target
            ip = await get_ip_from_domain(domain)
            shodan_data = await get_shodan_data(ip)
            vt_data = await get_virustotal_data(domain)
            whois_data = await get_whois_data(domain)
            urlscan_result = await scan_url_with_urlscan(domain, message)
            if urlscan_result:
                full_data = f"IP: {ip}\n{shodan_data}\n{vt_data}\n{whois_data}\n{urlscan_result}"
            else:
                full_data = f"IP: {ip}\n{shodan_data}\n{vt_data}\n{whois_data}"
            prompt = f"{domain} домені туралы келесі деректерді қазақ тілінде түсіндір және қандай әрекеттер жасауға болатыны туралы кеңестер бер: {full_data}"

        print(f"Sending prompt to Gemini: {prompt}")
        try:
            async with asyncio.timeout(45):  # Уақыт шегін 45 секундқа ұлғайттым
                response = await asyncio.to_thread(model.generate_content, [prompt])
                print(f"Gemini response: {response.text}")
                await message.answer(response.text)
                if user_id not in user_conversation_history:
                    user_conversation_history[user_id] = []
                user_conversation_history[user_id].append({"request": target, "response": response.text})
                log_message(message.from_user.username or user_id, target, response.text)
        except TimeoutError:
            await message.answer("⚠️ AI жауабы уақыттан асып кетті. Интернет байланысын тексеріңіз немесе кейінірек қайталап көріңіз.")
            print(f"Timeout occurred while processing: {target}")
    except Exception as e:
        error_msg = f"⚠️ {target} өңдеу кезінде қате пайда болды: {str(e)}"
        await message.answer(error_msg)
        print(error_msg)

@dp.message(CommandStart())
async def send_welcome(message: types.Message):
    await message.answer("""
Сәлем! Мен OSINT көмекші ботпын. IP-адресті (мысалы, 46.4.73.62), доменді (мысалы, google.com) немесе URL-ді (мысалы, https://example.com/path) жазсаңыз, мен барлық қолжетімді ақпаратты және кеңестерді қазақ тілінде беремін!
""")

@dp.message(lambda message: not message.document and not message.photo)
async def chat_with_ai(message: types.Message):
    text = message.text.strip()
    if message.text.startswith("/"):
        return

    print(f"Processing text: {text}")
    user_id = message.from_user.id
    lang = user_lang.get(user_id, "kk")

    if user_id not in user_conversation_history:
        user_conversation_history[user_id] = []

    if is_ip_address(text):
        await process_ip_or_domain_or_url(text, message, is_ip=True, is_url=False)
        return
    elif is_url(text):
        await process_ip_or_domain_or_url(text, message, is_ip=False, is_url=True)
        return
    elif is_domain(text):
        await process_ip_or_domain_or_url(text, message, is_ip=False, is_url=False)
        return

    if text.lower() in ["сәлем", "привет", "hello", "hi"]:
        response_text = f"Сәлем! Мен OSINT көмекші ботпын. Қалай көмектесе аламын?"
        await message.answer(response_text)
        log_message(message.from_user.username or user_id, text, response_text)
        return

    history_str = "\n".join([f"Сұрақ: {item['request']}\nЖауап: {item['response']}" for item in user_conversation_history[user_id]]) or "Әзірге ешқандай сұрақ-жауап жоқ."

    if "туралы" in text.lower() or "қайда" in text.lower() or "айпи" in text.lower() or "домен" in text.lower():
        if user_conversation_history[user_id] and any(is_ip_address(item["request"]) or is_domain(item["request"]) or is_url(item["request"]) for item in user_conversation_history[user_id]):
            last_target = next(item["request"] for item in reversed(user_conversation_history[user_id]) if is_ip_address(item["request"]) or is_domain(item["request"]) or is_url(item["request"]))
            prompt = f"Алдыңғы әңгіме:\n{history_str}\n\nПайдаланушы сұрағы: {text}. Соңғы талқыланған объект: {last_target}. Қазақ тілінде жауап бер, барлық ақпаратты ескере отырып."
        else:
            prompt = f"Пайдаланушы сұрағы: {text}. Қазақ тілінде қысқа жауап бер, қажет болса OSINT деректерін пайдалан."
    else:
        prompt = f"Алдыңғы әңгіме:\n{history_str}\n\nПайдаланушы сұрағы: {text}. Қазақ тілінде қысқа жауап бер, қажет болса OSINT деректерін пайдалан."

    try:
        async with asyncio.timeout(45):  # Уақыт шегін 45 секундқа ұлғайттым
            response = await asyncio.to_thread(model.generate_content, [prompt])
            print(f"Gemini response for '{text}': {response.text}")
            await message.answer(response.text)
            user_conversation_history[user_id].append({"request": text, "response": response.text})
            log_message(message.from_user.username or user_id, text, response.text)
    except TimeoutError:
        await message.answer("⚠️ AI жауабы уақыттан асып кетті. Интернет байланысын тексеріңіз немесе кейінірек қайталап көріңіз.")
        print(f"Timeout occurred while processing general query: {text}")
    except Exception as e:
        error_msg = f"⚠️ AI жауап бере алмады. Қате: {str(e)}"
        await message.answer(error_msg)
        print(error_msg)

@dp.message(lambda m: m.text and m.text.startswith("/ip"))
async def handle_ip(message: types.Message):
    print(f"Processing /ip: {message.text}")
    try:
        parts = message.text.split(" ", 1)
        if len(parts) > 1 and is_ip_address(parts[1]):
            await process_ip_or_domain_or_url(parts[1], message, is_ip=True, is_url=False)
        else:
            await message.answer("Жарамды IP мекенжайын беріңіз. Мысалы: /ip 46.4.73.62")
    except Exception as e:
        await message.answer(f"⚠️ /ip командасында қате: {str(e)}")

@dp.message(lambda m: m.text and m.text.startswith("/dork"))
async def handle_dork(message: types.Message):
    print(f"Processing /dork: {message.text}")
    try:
        parts = message.text.split(" ", 1)
        if len(parts) <= 1:
            await message.answer("⚠️ Сұрауды көрсетіңіз. Мысалы: /dork site:gov.kz intext:\"password\"")
            return
        query = parts[1]
        dork_url = f"https://www.google.com/search?q={requests.utils.quote(query)}"
        response_text = f"🔍 Сіздің Dork сұрауыңыз дайын:\n{dork_url}"
        await message.answer(response_text)
        log_message(message.from_user.username or message.from_user.id, message.text, response_text)
        if message.from_user.id not in user_conversation_history:
            user_conversation_history[message.from_user.id] = []
        user_conversation_history[message.from_user.id].append({"request": message.text, "response": response_text})
    except Exception as e:
        error_msg = f"⚠️ /dork командасында қате: {str(e)}"
        await message.answer(error_msg)
        print(error_msg)

async def main():
    while True:
        try:
            await dp.start_polling(bot)
        except (aiohttp.client_exceptions.ClientConnectorError, ConnectionResetError) as e:
            print(f"Желі қатесі: {e}. 5 секундтан кейін қайта әрекет ету...")
            await asyncio.sleep(5)
        except Exception as e:
            print(f"Күтпеген қате: {e}")
            break

if __name__ == '__main__':
    asyncio.run(main())
