package com.yr.recipemanager.service;

import com.yr.recipemanager.entity.Person;
import com.yr.recipemanager.entity.Recipe;
import com.yr.recipemanager.exception.ForbiddenException;
import com.yr.recipemanager.exception.ResourceNotFoundException;
import com.yr.recipemanager.repository.PersonRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PersonService {

    private static final Logger log = LoggerFactory.getLogger(PersonService.class);

    private final PersonRepository personRepository;

    public PersonService(PersonRepository personRepository) {
        this.personRepository = personRepository;
    }

    public List<Person> getAllPeople() {
        List<Person> people = personRepository.findAll();
        log.info("Fetched {} people", people.size());
        return people;
    }

    public Person getPersonById(Long id) {
        log.debug("Looking up person with id {}", id);
        return personRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("Person not found with id {}", id);
                    return new ResourceNotFoundException("Person not found with id: " + id);
                });
    }

    public Person createPerson(Person person) {
        if (person.getRole() == null || person.getRole().isBlank()) {
            person.setRole("USER");
        }
        Person saved = personRepository.save(person);
        log.info("Created person with id {}", saved.getId());
        return saved;
    }

    public Person updatePerson(Long id, Person updatedPerson) {
        Person existing = getPersonById(id);
        existing.setName(updatedPerson.getName());
        existing.setEmail(updatedPerson.getEmail());
        existing.setPhone(updatedPerson.getPhone());
        if (updatedPerson.getRole() == null || updatedPerson.getRole().isBlank()) {
            existing.setRole(existing.getRole() == null ? "USER" : existing.getRole());
        } else {
            existing.setRole(updatedPerson.getRole());
        }
        Person saved = personRepository.save(existing);
        log.info("Updated person with id {}", id);
        return saved;
    }

    public void deletePerson(Long id) {
        Person existing = getPersonById(id);
        personRepository.delete(existing);
        log.info("Deleted person with id {}", id);
    }

    private Person requireRequester(Long requesterId) {
        if (requesterId == null) {
            throw new ForbiddenException("Missing requester identity (X-User-Id header)");
        }
        return getPersonById(requesterId);
    }

    public void requireAdmin(Long requesterId) {
        Person requester = requireRequester(requesterId);
        if (!"ADMIN".equalsIgnoreCase(requester.getRole())) {
            log.warn("Person id {} (role {}) attempted an ADMIN-only action", requester.getId(), requester.getRole());
            throw new ForbiddenException("Access denied: ADMIN role required");
        }
    }

    public void requireAdminOrSelf(Long requesterId, Long targetPersonId) {
        Person requester = requireRequester(requesterId);
        if ("ADMIN".equalsIgnoreCase(requester.getRole())) {
            return;
        }
        if (!requester.getId().equals(targetPersonId)) {
            log.warn("Person id {} attempted to view recipes of person id {}", requester.getId(), targetPersonId);
            throw new ForbiddenException("Access denied: you can only view your own recipes");
        }
    }

    public List<Recipe> getRecipesByPerson(Long id) {
        Person person = getPersonById(id);
        List<Recipe> recipes = person.getRecipes();
        log.info("Person with id {} has {} recipes", id, recipes.size());
        return recipes;
    }
}
