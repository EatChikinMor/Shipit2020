import aiohttp
import asyncio
import uvicorn
from fastai import *
from fastai.vision import *
from io import BytesIO
from starlette.applications import Starlette
from starlette.middleware.cors import CORSMiddleware
from starlette.responses import HTMLResponse, JSONResponse
from starlette.staticfiles import StaticFiles

export_lung_file_url = 'https://www.dropbox.com/s/qtab7fif08cpahw/lung-condition-796.pkl?raw=1'
export_lung_file_name = 'lung-condition-796.pkl'

export_baseball_file_url = 'https://www.dropbox.com/s/izy2c9bvv2757vz/export_baseball.pkl?raw=1'
export_baseball_file_name = 'export_baseball.pkl'



classes = ['cricket', 'baseball']
path = Path(__file__).parent

app = Starlette()
app.add_middleware(CORSMiddleware, allow_origins=['*'], allow_headers=['X-Requested-With', 'Content-Type'])
app.mount('/static', StaticFiles(directory='app/static'))


async def download_file(url, dest):
    if dest.exists(): return
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            data = await response.read()
            with open(dest, 'wb') as f:
                f.write(data)


async def setup_learner(url, filename):
    await download_file(url, path / filename)
    try:
        learn = load_learner(path, filename)
        return learn
    except RuntimeError as e:
        if len(e.args) > 0 and 'CPU-only machine' in e.args[0]:
            print(e)
            message = "\n\nThis model was trained with an old version of fastai and will not work in a CPU environment.\n\nPlease update the fastai library in your training environment and export your model again.\n\nSee instructions for 'Returning to work' at https://course.fast.ai."
            raise RuntimeError(message)
        else:
            raise


# loop = asyncio.get_event_loop()
# tasks = [asyncio.ensure_future(setup_learner(export_baseball_file_url, export_baseball_file_name))]
# learner = loop.run_until_complete(asyncio.gather(*tasks))[0]
# loop.close()


@app.route('/')
async def homepage(request):
    html_file = path / 'view' / 'index.html'
    return HTMLResponse(html_file.open().read())


@app.route('/analyze/Baseball', methods=['POST'])
async def analyze(request):
    loop = asyncio.get_event_loop()
    tasks = [asyncio.ensure_future(setup_learner(export_baseball_file_url, export_baseball_file_name))]
    learner = loop.run_until_complete(asyncio.gather(*tasks))[0]
    loop.close()
    img_data = await request.form()
    img_bytes = await (img_data['file'].read())
    img = open_image(BytesIO(img_bytes))
    prediction = baseball_learner.predict(img)[0]
    return JSONResponse({'result': str(prediction)})

@app.route('/analyze/Lung', methods=['POST'])
async def analyze(request):
    loop = asyncio.get_event_loop()
    tasks = [asyncio.ensure_future(setup_learner(export_lung_file_url, export_lung_file_name))]
    learner = loop.run_until_complete(asyncio.gather(*tasks))[0]
    loop.close()
    img_data = await request.form()
    img_bytes = await (img_data['file'].read())
    img = open_image(BytesIO(img_bytes))
    prediction = lung_learner.predict(img)[0]
    return JSONResponse({'result': str(prediction)})


if __name__ == '__main__':
    if 'serve' in sys.argv:
        uvicorn.run(app=app, host='0.0.0.0', port=5000, log_level="info")
