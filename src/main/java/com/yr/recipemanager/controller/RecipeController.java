package com.yr.recipemanager.controller;

import com.yr.recipemanager.entity.Recipe;
import com.yr.recipemanager.service.PersonService;
import com.yr.recipemanager.service.RecipeService;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/recipes")
public class RecipeController {

    private final RecipeService recipeService;
    private final PersonService personService;

    public RecipeController(RecipeService recipeService, PersonService personService) {
        this.recipeService = recipeService;
        this.personService = personService;
    }

    @GetMapping
    public List<Recipe> getAllRecipes(
            @RequestHeader(value = "X-User-Id", required = false) Long requesterId) {
        personService.requireAdmin(requesterId);
        return recipeService.getAllRecipes();
    }

    @GetMapping("/{id}")
    public Recipe getRecipeById(@PathVariable Long id) {
        return recipeService.getRecipeById(id);
    }

    @PostMapping("/person/{personId}")
    public Recipe createRecipeForPerson(@PathVariable Long personId, @RequestBody Recipe recipe) {
        return recipeService.createRecipeForPerson(personId, recipe);
    }

    @PutMapping("/{id}")
    public Recipe updateRecipe(@PathVariable Long id, @RequestBody Recipe recipe) {
        return recipeService.updateRecipe(id, recipe);
    }

    @DeleteMapping("/{id}")
    public String deleteRecipe(@PathVariable Long id) {
        recipeService.deleteRecipe(id);
        return "Recipe with id " + id + " was deleted.";
    }
}
