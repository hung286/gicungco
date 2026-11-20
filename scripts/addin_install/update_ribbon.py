import zipfile
import os
import shutil

dotm_path = 'ADDIN/MH2026.dotm'
temp_dotm = 'ADDIN/MH2026_temp.dotm'

with zipfile.ZipFile(dotm_path, 'r') as zin:
    xml_data = zin.read('customUI/customUI14.xml').decode('utf-8')
    
    modified = False
    
    # 1. In Mgroup1-2 (Tab MH2026)
    if 'btnBangHoaTeX' not in xml_data:
        target1 = '<button id="btnChuanHoaTeX"'
        insert1 = '''<button id="btnBangHoaTeX" label="B&#7843;ng h&#243;a TeX"
                        imageMso= "TableInsert" size="large"
				screentip= "Chuy&#7875;n &#273;&#7893;i b&#7843;ng LaTeX (\\begin{tabular}) th&#224;nh Word Table"
                        supertip= "T&#7921; &#273;&#7897;ng chuy&#7875;n c&#225;c b&#7843;ng LaTeX \\begin{tabular}...\\end{tabular} do AI t&#7841;o th&#224;nh b&#7843;ng Word chu&#7849;n c&#243; k&#7867; vi&#7873;n, c&#259;n gi&#7919;a, t&#7921; co gi&#227;n v&#224; gi&#7915; nguy&#234;n c&#244;ng th&#7913;c $ $ &#273;&#7875; chuy&#7875;n MathType."
                        onAction= "MH_BangHoa" />
''' + target1
        xml_data = xml_data.replace(target1, insert1, 1)
        modified = True
        print('Added btnBangHoaTeX to Mgroup1-2')

    # 2. In Mgroup1-1 (Tab Tools_MH2026, next to MathType hóa M1)
    if 'btnBangHoaM1' not in xml_data:
        target2 = 'onAction= "MathTypeConvert" />'
        insert2 = '''onAction= "MathTypeConvert" />
			<button id="btnBangHoaM1" label="B&#7843;ng h&#243;a"
                        imageMso= "TableInsert" size="large"
				screentip= "B&#7843;ng h&#243;a c&#225;c b&#7843;ng TeX th&#224;nh Word Table"
                        supertip= "Chuy&#7875;n c&#225;c b&#7843;ng LaTeX \\begin{tabular}...\\end{tabular} th&#224;nh b&#7843;ng Word."
                        onAction= "MH_BangHoa" />'''
        xml_data = xml_data.replace(target2, insert2, 1)
        modified = True
        print('Added btnBangHoaM1 to Mgroup1-1')

    if modified:
        with zipfile.ZipFile(temp_dotm, 'w', compression=zipfile.ZIP_DEFLATED) as zout:
            for item in zin.infolist():
                if item.filename == 'customUI/customUI14.xml':
                    zout.writestr(item, xml_data.encode('utf-8'))
                else:
                    zout.writestr(item, zin.read(item.filename))
        shutil.move(temp_dotm, dotm_path)
        print('Updated ADDIN/MH2026.dotm with Bảng hóa buttons successfully!')
    else:
        print('Bảng hóa buttons already present.')
