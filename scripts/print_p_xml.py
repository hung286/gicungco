import zipfile, xml.etree.ElementTree as ET

z = zipfile.ZipFile('de 0111.docx')
xml_content = z.read('word/document.xml')
tree = ET.fromstring(xml_content)
w_ns = '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'

for p in tree.iter(f'{w_ns}p'):
    text = ''.join(p.itertext())
    if '0111' in text:
        print(ET.tostring(p, encoding='utf-8').decode('utf-8'))
        print('='*50)
