from PIL import Image
from lxml import etree
import pdb
import io
import base64


pngtxt = base64.b64encode(open("image.png","rb").read())
f = open("png1_b64.txt", "w")
f.write(pngtxt.decode())
f.close()

#------

newpngtxt = open("image.svg", "rb").read()
g = open("out.png", "wb")
msg = base64.b64decode(newpngtxt)
g.write(msg)
g.close()

buf = io.BytesIO(msg)
image = Image.open(buf)
image.save("foo.png")
