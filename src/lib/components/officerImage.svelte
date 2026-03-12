<script>
    export let image = '';
    export let name = '';
    export let role = '';
    export let description = '';
</script>

<div class="officer-card">
    <img src={image} alt={name} />
    <div class="overlay">
        <h3>{name}</h3>
        <p class="role">{role}</p>
        <p class="description">{description}</p>
    </div>
</div>

<style>
    .officer-card {
        position: relative;
        overflow: hidden;
        border-radius: 8px;
        aspect-ratio: 1;
        cursor: pointer;
    }

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
    }

    .overlay {
        position: absolute;
        inset: 0;
        background: linear-gradient(135deg, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.5));
        backdrop-filter: blur(8px);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        color: white;
        text-align: center;
        opacity: 0;
        transition: opacity 0.3s ease;
        padding: 1rem;
    }

    .officer-card:hover .overlay {
        opacity: 1;
    }

    h3 {
        margin: 0 0 0.5rem 0;
        font-size: 1.5rem;
        font-weight: 600;
    }

    .role {
        margin: 0 0 0.75rem 0;
        font-size: 0.9rem;
        font-weight: 500;
        opacity: 0.9;
    }

    .description {
        margin: 0;
        font-size: 0.85rem;
        opacity: 0.8;
    }
</style>