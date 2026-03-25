// Set current year in footer
document.getElementById('year').textContent = new Date().getFullYear();

// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    const icon = hamburger.querySelector('i');
    if (navLinks.classList.contains('active')) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-times');
    } else {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
    }
});

// Close mobile menu when clicking a link
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        hamburger.querySelector('i').classList.remove('fa-times');
        hamburger.querySelector('i').classList.add('fa-bars');
    });
});

// Typing Effect Animation
const typed = document.querySelector('.typed');
if (typed) {
    let typed_strings = typed.getAttribute('data-typed-items');
    typed_strings = typed_strings.split(',');
    let stringIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function typeEffect() {
        const currentString = typed_strings[stringIndex].trim();
        
        if (isDeleting) {
            typed.textContent = currentString.substring(0, charIndex - 1);
            charIndex--;
        } else {
            typed.textContent = currentString.substring(0, charIndex + 1);
            charIndex++;
        }

        let typeSpeed = 100; // Typing speed
        
        if (isDeleting) {
            typeSpeed /= 2; // Delete faster
        }

        if (!isDeleting && charIndex === currentString.length) {
            typeSpeed = 2000; // Pause at end of word
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            stringIndex = (stringIndex + 1) % typed_strings.length;
            typeSpeed = 500; // Pause before typing new word
        }

        setTimeout(typeEffect, typeSpeed);
    }
    
    // Start typing effect slightly after load
    setTimeout(typeEffect, 500);
}

// Form Submission Handling
const contactForm = document.getElementById('contactForm');
const submitBtn = document.getElementById('submitBtn');
const formStatus = document.getElementById('formStatus');

contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Get form data
    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        subject: document.getElementById('subject').value,
        message: document.getElementById('message').value
    };

    // Update UI to show loading state
    const originalBtnContent = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span>Sending...</span> <i class="fas fa-spinner fa-spin"></i>';
    submitBtn.disabled = true;
    formStatus.textContent = '';
    formStatus.className = 'form-status';

    try {
        const response = await fetch('/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        // Check if response is JSON
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            const data = await response.json();
            if (response.ok && data.success) {
                formStatus.textContent = data.message || 'Message sent successfully!';
                formStatus.classList.add('status-success');
                contactForm.reset();
            } else {
                throw new Error(data.error || 'Server error occurred.');
            }
        } else {
            // Not JSON (probably a 500 HTML error page)
            const text = await response.text();
            console.error('Non-JSON response:', text);
            throw new Error('Server Error (Check Render Logs)');
        }
    } catch (error) {
        console.error('Submission error:', error);
        formStatus.textContent = error.message;
        formStatus.classList.add('status-error');
    } finally {
        // Reset button state
        submitBtn.innerHTML = originalBtnContent;
        submitBtn.disabled = false;
        
        // Clear status message after 5 seconds
        setTimeout(() => {
            formStatus.textContent = '';
            formStatus.className = 'form-status';
        }, 5000);
    }
});
