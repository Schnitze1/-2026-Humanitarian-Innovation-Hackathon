import urllib.request
import json
import urllib.parse
import ssl

ssl._create_default_https_context = ssl._create_unverified_context

topics = [
    ("Agriculture and Forestry", "Fiji agriculture farmer"),
    ("Climate Change, Disasters and Risks", "Samoa climate change island"),
    ("Economy", "Vanuatu market economy"),
    ("Education", "Tonga school education children"),
    ("Energy", "Pacific island solar energy panel"),
    ("Environment", "Fiji environment nature"),
    ("Fisheries and Aquaculture", "Samoa fishing boat"),
    ("Food", "Vanuatu food market"),
    ("Gender", "Tonga women working"),
    ("Health", "Pacific island health clinic"),
    ("Information, Communication and Technology", "Fiji technology computer"),
    ("Ocean and Maritime", "Samoa ocean coast"),
    ("Population", "Vanuatu people village"),
    ("Social and Culture", "Tonga culture traditional ceremony")
]

base_url = "https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrlimit=1&prop=imageinfo&iiprop=url&format=json&gsrsearch="

results = []

for key, search_term in topics:
    url = base_url + urllib.parse.quote(search_term)
    req = urllib.request.Request(url, headers={'User-Agent': 'Aiga-Hackathon-Bot/1.0'})
    try:
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            pages = data.get('query', {}).get('pages', {})
            if pages:
                page_id = list(pages.keys())[0]
                image_url = pages[page_id]['imageinfo'][0]['url']
                results.append(f'  "{key}": "{image_url}",')
            else:
                results.append(f'  "{key}": "https://upload.wikimedia.org/wikipedia/commons/d/d5/A_farmer_in_Fiji%2C_May_2012._Photo-_DFAT_%2812422885383%29.jpg",')
    except Exception as e:
        print(f"Failed {search_term}: {e}")
        results.append(f'  "{key}": "https://upload.wikimedia.org/wikipedia/commons/d/d5/A_farmer_in_Fiji%2C_May_2012._Photo-_DFAT_%2812422885383%29.jpg",')

print("export const TOPIC_IMAGES = {\n" + "\n".join(results) + "\n};")
