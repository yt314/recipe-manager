package com.yr.recipemanager.service;

import com.yr.recipemanager.entity.Person;
import com.yr.recipemanager.entity.Recipe;
import com.yr.recipemanager.exception.ResourceNotFoundException;
import com.yr.recipemanager.repository.RecipeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RecipeService {

    private static final Logger log = LoggerFactory.getLogger(RecipeService.class);

    private final RecipeRepository recipeRepository;
    private final PersonService personService;

    public RecipeService(RecipeRepository recipeRepository, PersonService personService) {
        this.recipeRepository = recipeRepository;
        this.personService = personService;
    }

    public List<Recipe> getAllRecipes() {
        List<Recipe> recipes = recipeRepository.findAll();
        log.info("Fetched {} recipes", recipes.size());
        return recipes;
    }

    public Recipe getRecipeById(Long id) {
        log.debug("Looking up recipe with id {}", id);
        return recipeRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("Recipe not found with id {}", id);
                    return new ResourceNotFoundException("Recipe not found with id: " + id);
                });
    }

    public Recipe createRecipeForPerson(Long personId, Recipe recipe) {
        Person person = personService.getPersonById(personId);
        recipe.setPerson(person);
        Recipe saved = recipeRepository.save(recipe);
        log.info("Created recipe with id {} for person with id {}", saved.getId(), personId);
        return saved;
    }

    public Recipe updateRecipe(Long id, Recipe updatedRecipe) {
        Recipe existing = getRecipeById(id);
        existing.setTitle(updatedRecipe.getTitle());
        existing.setDescription(updatedRecipe.getDescription());
        existing.setIngredients(updatedRecipe.getIngredients());
        existing.setInstructions(updatedRecipe.getInstructions());
        existing.setCategory(updatedRecipe.getCategory());
        existing.setPrepTimeMinutes(updatedRecipe.getPrepTimeMinutes());
        Recipe saved = recipeRepository.save(existing);
        log.info("Updated recipe with id {}", id);
        return saved;
    }

    public void deleteRecipe(Long id) {
        Recipe existing = getRecipeById(id);
        recipeRepository.delete(existing);
        log.info("Deleted recipe with id {}", id);
    }
}
