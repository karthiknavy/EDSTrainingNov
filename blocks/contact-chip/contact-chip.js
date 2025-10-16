const contacts = [
    {
        image: "https://randomuser.me/api/portraits/men/32.jpg",
        name: "Alice Johnson"
    },
    {
        image: "https://randomuser.me/api/portraits/women/44.jpg",
        name: "Bob Smith"
    },
    {
        image: "https://randomuser.me/api/portraits/men/65.jpg",
        name: "Carol Lee"
    }
];

function renderContactChip(contact) {
    const chip = document.createElement('div');
    chip.className = 'contactchip';

    const img = document.createElement('img');
    img.src = contact.image;
    img.alt = contact.name;

    const name = document.createElement('span');
    name.className = 'contactchip-name';
    name.textContent = contact.name;

    chip.appendChild(img);
    chip.appendChild(name);

    return chip;
}

window.addEventListener('DOMContentLoaded', () => {
    contacts.forEach(contact => {
        document.body.appendChild(renderContactChip(contact));
    });
});