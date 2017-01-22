def extract_books(filename="isbnsFall16_names.dat"):
    """Extracts all the books that will be needed in the next semester.


    Arguments:
    filename: file name to save temporal data, to analyze with compare_with_db
    """
    import requests
    from bs4 import BeautifulSoup

    cookies = {
        's_vnum': '1440621181017%26vn%3D1',
        's_fid': '0EF2E6D54E22CAAA-084C34FDA4EC5F3D',
        '__utma': '54619247.234461063.1437860582.1438191847.1438191847.1',
        '__utmz': '54619247.1438191847.1.1.utmcsr=google|utmccn=(organic)|utmcmd=organic|utmctr=(not%20provided)',
        'ASPSESSIONIDSCQDDRCQ': 'FBDNKLMABLDHPHCHGANLMKCG',
        'ASPSESSIONIDQCSBCQDT': 'OEDPCJMAMCFMELHHNLCMKLHG',
        'referring_url': 'https%3A//www.google.es/',
        '_ga': 'GA1.2.234461063.1437860582',
        '_gat': '1',
        '_gat_unitTracker': '1',
        'mscssid': '280FE7B7BA944614A67CE36A236CBAE3',
        'cookies': 'true',
    }

    headers = {
        'Pragma': 'no-cache',
        'Origin': 'http://uvmbookstore.uvm.edu',
        'Accept-Encoding': 'gzip, deflate',
        'Accept-Language': 'es,en-US;q=0.8,en;q=0.6',
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.89 Safari/537.36',
        'HTTPS': '1',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Cache-Control': 'no-cache',
        'Referer': 'http://uvmbookstore.uvm.edu/default.asp?',
        'Connection': 'keep-alive',
    }

    #Weird format from the UVM bookstore site
    books = ["7"+"0"*(4-len(str(_)))+str(_) for _ in range(0,1+9999)]
    term = '0%7C0&'

    while books:
        booksT = books[:100]
        books = books[100:]
        booksT = "%2C".join(booksT)

        data = 'tbe-block-mode=0&selTerm='+term+'generate-book-list=Get+Your+Books&sectionIds='+booksT

        r = requests.post('http://uvmbookstore.uvm.edu/textbook_express.asp?mode=2&step=2', headers=headers, cookies=cookies, data=data)

        html = r.text
        soup = BeautifulSoup(html)

        ids = soup.find_all('span', {'class' : 'isbn'})
        names = soup.find_all('span', {'id' : 'course-bookdisplay-coursename'})

        for _,_2 in zip(ids,names):
            print(_.text,_2.text)

        with open(filename,"a+") as f:
            for _,_2 in zip(ids,names):
                f.write("%s\t%s\n"  %(_.text, _2.text.replace(",","-")))

def compare_with_db(filename,filename_results,pwd):
    """Extracts all the books that will be needed in the next semester.


    Arguments:
    filename: file name where the temporal data was saved
    filename_results: file name to save the results
    """
    from pymongo import MongoClient
    from pyisbn import convert
    booksUVM = set()
    with open(filename_results) as f:
        for line in f:
            booksUVM.update([line.rstrip()])

    booksB4E = set()
    d_booksB4E = dict()

    #connect
    client = MongoClient('127.0.0.1',61296)
    db = client.b4e
    db.authenticate('admin', pwd)#

    #check available books
    collect = db.books
    for book in collect.find({}):
        isbn = book["_meta"]["isbn"]
        if len(isbn) == 13:
            isbn = convert(isbn)
        d_booksB4E[isbn] = book["title"]
        booksB4E.update([isbn])

    #keep the intersectoin between books needed (booksUVM) and books we have (booksB4e)
    with open(filename_results,"w") as f:
        for _ in (booksB4E & booksUVM):
            if d_booksB4E[_]:
                f.write(_+"\t"+d_booksB4E[_]+"\n")
            else:
                f.write(_+"\t"+"unknown"+"\n")

    print(len(booksUVM))
    print(booksB4E)
    print(len(booksB4E))
    print(len(booksB4E - booksUVM))


extract_books(filename="isbnsFall16_names.dat")
compare_with_db(filename="isbnsFall16_names.dat",filename_results="isbnsFall16_useful.txt",pwd='DZviApFlab-U')
