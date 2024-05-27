    document.getElementById('file-input').addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function() {
                if (file.type === 'application/pdf') {
                    processPDF(reader.result);
                } else {
                    processImage(reader.result);
                }
            };
            reader.readAsDataURL(file);
        }
    });

    function processImage(dataURL) {
        Tesseract.recognize(
            dataURL,
            'eng',
            {
                logger: m => console.log(m)
            }
        ).then(({ data: { text } }) => {
            document.getElementById('output').innerText = text;
        });
    }

    function processPDF(dataURL) {
        const loadingTask = pdfjsLib.getDocument(dataURL);
        loadingTask.promise.then(function(pdf) {
            pdf.getPage(1).then(function(page) {
                const scale = 1.5;
                const viewport = page.getViewport({ scale: scale });

                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                const renderContext = {
                    canvasContext: context,
                    viewport: viewport
                };
                page.render(renderContext).promise.then(function() {
                    const dataURL = canvas.toDataURL();
                    processImage(dataURL);
                });
            });
        }, function(reason) {
            console.error(reason);
        });
    }