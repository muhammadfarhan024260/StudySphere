using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudySphere.Models;
using StudySphere.Repositories;

namespace StudySphere.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class SubjectController : ControllerBase
{
    private readonly ISubjectRepository _subjectRepository;

    public SubjectController(ISubjectRepository subjectRepository)
    {
        _subjectRepository = subjectRepository;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllSubjects()
    {
        try
        {
            var subjects = await _subjectRepository.GetAllAsync();
            return Ok(new { success = true, subjects });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = "Failed to fetch subjects.", error = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetSubject(int id)
    {
        try
        {
            var subject = await _subjectRepository.GetByIdAsync(id);
            if (subject == null)
            {
                return NotFound(new { success = false, message = "Subject not found." });
            }
            return Ok(new { success = true, subject });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = "Failed to fetch subject.", error = ex.Message });
        }
    }

    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<IActionResult> CreateSubject([FromBody] Subject subject)
    {
        if (string.IsNullOrWhiteSpace(subject.Name))
        {
            return BadRequest(new { success = false, message = "Subject name is required." });
        }

        try
        {
            var createdSubject = await _subjectRepository.CreateAsync(subject);
            return CreatedAtAction(nameof(GetSubject), new { id = createdSubject.SubjectId }, new { success = true, subject = createdSubject, message = "Subject created successfully." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = "Failed to create subject.", error = ex.Message });
        }
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateSubject(int id, [FromBody] Subject subject)
    {
        if (id != subject.SubjectId)
        {
            return BadRequest(new { success = false, message = "Subject ID mismatch." });
        }

        if (string.IsNullOrWhiteSpace(subject.Name))
        {
            return BadRequest(new { success = false, message = "Subject name is required." });
        }

        try
        {
            var existingSubject = await _subjectRepository.GetByIdAsync(id);
            if (existingSubject == null)
            {
                return NotFound(new { success = false, message = "Subject not found." });
            }

            existingSubject.Name = subject.Name;
            existingSubject.Category = subject.Category;
            existingSubject.TargetHours = subject.TargetHours;

            await _subjectRepository.UpdateAsync(existingSubject);
            return Ok(new { success = true, message = "Subject updated successfully.", subject = existingSubject });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = "Failed to update subject.", error = ex.Message });
        }
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteSubject(int id)
    {
        try
        {
            var existingSubject = await _subjectRepository.GetByIdAsync(id);
            if (existingSubject == null)
            {
                return NotFound(new { success = false, message = "Subject not found." });
            }

            await _subjectRepository.DeleteAsync(id);
            return Ok(new { success = true, message = "Subject deleted successfully." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = "Failed to delete subject.", error = ex.Message });
        }
    }
}
