package com.yr.recipemanager.repository;

import com.yr.recipemanager.entity.Recipe;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RecipeRepository extends JpaRepository<Recipe, Long> {

    List<Recipe> findByPersonId(Long personId);
}
