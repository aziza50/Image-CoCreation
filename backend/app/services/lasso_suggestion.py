from app.services.diffusion_model import generate_image_inpainting

def lasso_suggestion(mask_input, image_input, prompt, token):    
    #for now, I'll just not even revise the prompt-> just send to the diffusion model
    return generate_image_inpainting(mask_input, image_input, prompt, token)