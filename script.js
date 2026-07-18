// Initialize AOS
        AOS.init({ once: true, offset: 50, duration: 800 });

        // Sticky Navbar effect
        window.addEventListener('scroll', function() {
            const navbar = document.querySelector('.navbar');
            if (window.scrollY > 50) {
                navbar.classList.add('shadow-sm');
                navbar.style.padding = "10px 0";
            } else {
                navbar.classList.remove('shadow-sm');
                navbar.style.padding = "15px 0";
            }
        });

        // Smooth scrolling for nav links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                if(this.getAttribute('data-bs-toggle') === 'modal') return;
                
                e.preventDefault();
                const targetId = this.getAttribute('href');
                if(targetId === '#') return;
                
                const target = document.querySelector(targetId);
                if(target) {
                    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
                    if(this.classList.contains('nav-link')) this.classList.add('active');

                    const headerOffset = 80;
                    const elementPosition = target.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
  
                    window.scrollTo({ top: offsetPosition, behavior: "smooth" });
                }
            });
        });

        // MOCK DATABASE
        const productsDB = [
            { id: 1, name: "Tomat Ceri Hidroponik", price: 25000, category: "sayuran", image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?q=80&w=800&auto=format&fit=crop", badge: "Organik" },
            { id: 2, name: "Selada Keriting Segar", price: 15000, category: "sayuran", image: "https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?q=80&w=800&auto=format&fit=crop", badge: "Terlaris" },
            { id: 3, name: "Traktor Mini Cultivator", price: 4500000, category: "alat", image: "https://images.unsplash.com/photo-1592982537447-6f2334cb4275?q=80&w=800&auto=format&fit=crop", badge: "Sewa/Beli" },
            { id: 4, name: "Pupuk Kompos Premium 5Kg", price: 45000, category: "pupuk", image: "https://images.unsplash.com/photo-1629851722849-c167d307bc1b?q=80&w=800&auto=format&fit=crop", badge: "Baru" },
            { id: 5, name: "Wortel Manis Berastagi", price: 18000, category: "sayuran", image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?q=80&w=800&auto=format&fit=crop", badge: "" },
            { id: 6, name: "Benih Cabai Rawit Unggul", price: 35000, category: "pupuk", image: "https://images.unsplash.com/photo-1588144007887-f82eafe3c1cb?q=80&w=800&auto=format&fit=crop", badge: "Promo" }
        ];

        const formatIDR = (number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(number);

        function renderProducts(category = 'all') {
            const container = document.getElementById('productsContainer');
            container.innerHTML = '';
            
            let delay = 0;
            productsDB.forEach(product => {
                if(category === 'all' || product.category === category) {
                    const badgeHtml = product.badge ? `<span class="product-badge">${product.badge}</span>` : '';
                    const html = `
                        <div class="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="${delay}">
                            <div class="product-card">
                                ${badgeHtml}
                                <div class="product-img-wrapper">
                                    <img src="${product.image}" alt="${product.name}" class="product-img">
                                </div>
                                <div class="product-body">
                                    <small class="text-success fw-bold text-uppercase mb-1 d-block" style="font-size:0.75rem;">${product.category}</small>
                                    <h5 class="product-title">${product.name}</h5>
                                    <p class="product-price">${formatIDR(product.price)}</p>
                                    <button class="btn add-to-cart-btn" onclick="addToCart(${product.id})">
                                        <i class="fa-solid fa-cart-plus me-2"></i> Tambah ke Keranjang
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;
                    container.innerHTML += html;
                    delay += 100;
                }
            });
        }

        // Filter Logic
        document.querySelectorAll('#productFilter .nav-link').forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                document.querySelectorAll('#productFilter .nav-link').forEach(b => {
                    b.classList.remove('active', 'bg-success', 'text-white');
                    b.classList.add('text-dark');
                });
                this.classList.add('active');
                renderProducts(this.getAttribute('data-filter'));
            });
        });

        // CART LOGIC
        let cart = [];

        function addToCart(productId) {
            const product = productsDB.find(p => p.id === productId);
            if(product) {
                const existing = cart.find(item => item.id === productId);
                if(existing) existing.quantity += 1;
                else cart.push({ ...product, quantity: 1 });
                
                updateCartUI();
                Swal.fire({ title: 'Ditambahkan!', text: `${product.name} berhasil masuk keranjang.`, icon: 'success', timer: 1500, showConfirmButton: false, toast: true, position: 'top-end' });
            }
        }

        function removeFromCart(productId) {
            cart = cart.filter(item => item.id !== productId);
            updateCartUI();
        }

        function updateCartUI() {
            const cartCount = document.getElementById('cartCount');
            const cartContainer = document.getElementById('cartItemsContainer');
            const emptyMsg = document.getElementById('emptyCartMsg');
            const cartTotalEl = document.getElementById('cartTotal');
            const checkoutBtn = document.getElementById('checkoutBtn');
            
            cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
            
            if(cart.length === 0) {
                emptyMsg.style.display = 'block';
                cartContainer.querySelectorAll('.cart-item').forEach(item => item.remove());
                cartTotalEl.textContent = 'Rp 0';
                checkoutBtn.disabled = true;
            } else {
                emptyMsg.style.display = 'none';
                cartContainer.querySelectorAll('.cart-item').forEach(item => item.remove());
                let total = 0;
                
                cart.forEach(item => {
                    total += item.price * item.quantity;
                    const itemHtml = `
                        <div class="cart-item">
                            <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                            <div class="cart-item-details">
                                <h6 class="cart-item-title">${item.name}</h6>
                                <div class="d-flex justify-content-between align-items-center mt-1">
                                    <span class="text-muted small">${item.quantity} x ${formatIDR(item.price)}</span>
                                    <span class="cart-item-price fw-bold">${formatIDR(item.price * item.quantity)}</span>
                                </div>
                            </div>
                            <div class="ms-3 cart-remove" onclick="removeFromCart(${item.id})"><i class="fa-solid fa-trash"></i></div>
                        </div>
                    `;
                    cartContainer.insertAdjacentHTML('beforeend', itemHtml);
                });
                cartTotalEl.textContent = formatIDR(total);
                checkoutBtn.disabled = false;
            }
        }

        function checkout() {
            bootstrap.Modal.getInstance(document.getElementById('cartModal')).hide();
            Swal.fire({ title: 'Memproses Pesanan...', timer: 2000, didOpen: () => Swal.showLoading() }).then(() => {
                cart = [];
                updateCartUI();
                Swal.fire({ title: 'Berhasil!', text: 'Pesanan Anda telah diterima.', icon: 'success', confirmButtonColor: '#2E7D32' });
            });
        }

        // Contact Form
        document.getElementById('contactForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('name').value;
            Swal.fire({ title: 'Mengirim Pesan...', didOpen: () => Swal.showLoading() });
            setTimeout(() => {
                Swal.fire({ title: 'Terkirim!', text: `Terima kasih ${name}, pesan telah tersimpan.`, icon: 'success', confirmButtonColor: '#2E7D32' });
                this.reset();
            }, 1500);
        });

        // ==========================================
        // GEMINI API INTEGRATION & LOGIC
        // ==========================================
        const apiKey = ""; // Diset kosong sesuai instruksi Canvas (di-inject di runtime)
        let chatHistory = [];

        // Utility: Exponential Backoff Fetch
        async function fetchWithBackoff(url, options, maxRetries = 3) {
            let retries = 0;
            while (retries <= maxRetries) {
                try {
                    const response = await fetch(url, options);
                    if (!response.ok) {
                        // Jika too many requests (429), selalu retry
                        if (response.status === 429) throw new Error("Throttled");
                        // Untuk error lain, jika kita mau retry bisa juga, tapi biasanya 429 yang di-backoff
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return await response.json();
                } catch (error) {
                    retries++;
                    if (retries > maxRetries) {
                        throw error;
                    }
                    // Exponential backoff: 1s, 2s, 4s
                    const delay = Math.pow(2, retries - 1) * 1000;
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }

        // --- Feature 1: TaniBot Chatbot ---
        function toggleChat() {
            const chatWindow = document.getElementById('chatWindow');
            chatWindow.classList.toggle('active');
        }

        function handleChatKeyPress(event) {
            if (event.key === 'Enter') {
                sendMessage();
            }
        }

        async function sendMessage() {
            const inputEl = document.getElementById('chatInput');
            const message = inputEl.value.trim();
            if (!message) return;

            appendMessage('user', message);
            inputEl.value = '';
            
            const typingIndicator = document.getElementById('chatTyping');
            typingIndicator.style.display = 'block';

            // Push to history
            chatHistory.push({ role: "user", parts: [{ text: message }] });

            const payload = {
                contents: chatHistory,
                systemInstruction: {
                    parts: [{ text: "Anda adalah 'TaniBot', asisten AI virtual dari platform pertanian 'TaniYuk'. Berikan jawaban yang singkat, padat, jelas, ramah, dan solutif seputar pertanian, teknik tanam, hama, cuaca, dan penggunaan platform TaniYuk kepada petani Indonesia. Gunakan bahasa Indonesia yang mudah dipahami." }]
                }
            };

            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

            try {
                const data = await fetchWithBackoff(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const botResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "Maaf, saya sedang mengalami gangguan sistem.";
                appendMessage('bot', botResponse);
                
                // Save bot response to history
                chatHistory.push({ role: "model", parts: [{ text: botResponse }] });

            } catch (error) {
                appendMessage('bot', "Maaf, terjadi kesalahan komunikasi dengan server AI.");
            } finally {
                typingIndicator.style.display = 'none';
            }
        }

        function appendMessage(sender, text) {
            const messagesContainer = document.getElementById('chatMessages');
            const msgDiv = document.createElement('div');
            msgDiv.classList.add('chat-msg', sender);
            
            // Format bold text if any (basic markdown support)
            let formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            msgDiv.innerHTML = formattedText;
            
            messagesContainer.appendChild(msgDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }

        // --- Feature 2: Deteksi Hama & Penyakit AI (Vision) ---
        let base64ImageData = null;

        function previewImage(input) {
            if (input.files && input.files[0]) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const preview = document.getElementById('file-upload-preview');
                    const placeholder = document.getElementById('uploadPlaceholder');
                    const btnAnalyze = document.getElementById('btnAnalyzeImage');
                    const resultBox = document.getElementById('aiDetectionResult');
                    
                    preview.src = e.target.result;
                    preview.style.display = 'block';
                    placeholder.style.display = 'none';
                    btnAnalyze.style.display = 'inline-block';
                    resultBox.style.display = 'none'; // Sembunyikan hasil lama
                    
                    // Extract base64 part (remove data:image/...;base64,)
                    base64ImageData = e.target.result.split(',')[1];
                }
                reader.readAsDataURL(input.files[0]);
            }
        }

        async function analyzePlant() {
            if (!base64ImageData) {
                Swal.fire('Error', 'Silakan unggah gambar terlebih dahulu', 'error');
                return;
            }

            const btnAnalyze = document.getElementById('btnAnalyzeImage');
            const loadingIndicator = document.getElementById('aiLoadingIndicator');
            const resultBox = document.getElementById('aiDetectionResult');

            btnAnalyze.style.display = 'none';
            loadingIndicator.classList.remove('d-none');
            resultBox.style.display = 'none';

            const prompt = "Bertindaklah sebagai ahli patologi tumbuhan (Dokter Tanaman). Analisis gambar daun atau tanaman ini. Identifikasi secara spesifik: 1. Nama Penyakit atau Hama (jika ada indikasi), 2. Penyebab & Gejala utama, 3. Langkah penanganan dan solusi ramah lingkungan (organik) yang bisa dilakukan petani.";

            const payload = {
                contents: [
                    {
                        role: "user",
                        parts: [
                            { text: prompt },
                            {
                                inlineData: {
                                    mimeType: "image/jpeg", // Defaulting to jpeg for generic payload, API usually adapts
                                    data: base64ImageData
                                }
                            }
                        ]
                    }
                ],
            };

            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

            try {
                const data = await fetchWithBackoff(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
                
                if (aiResponse) {
                    let formattedResponse = aiResponse.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                    formattedResponse = formattedResponse.replace(/\*(.*?)\*/g, '<em>$1</em>');
                    
                    resultBox.innerHTML = `<h6 class="text-success fw-bold"><i class="fa-solid fa-check-circle me-2"></i>Hasil Analisis AI:</h6><p class="mb-0 mt-2">${formattedResponse}</p>`;
                    resultBox.style.display = 'block';
                } else {
                    throw new Error("Empty response");
                }
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Analisis Gagal',
                    text: 'Gagal menganalisis gambar. Pastikan format gambar sesuai atau coba lagi nanti.',
                    confirmButtonColor: '#2E7D32'
                });
            } finally {
                loadingIndicator.classList.add('d-none');
                btnAnalyze.style.display = 'inline-block';
            }
        }

        // Init
        window.onload = function() {
            renderProducts();
            const activeFilter = document.querySelector('#productFilter .nav-link.active');
            if (activeFilter) {
                activeFilter.classList.remove('text-dark');
                activeFilter.classList.add('bg-success', 'text-white');
            }
        };