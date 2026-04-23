using StudySphere.Models;

namespace StudySphere.Repositories;

public interface IRecommendationRepository
{
    Task<int> AddAsync(Recommendation recommendation);
    Task<bool> UpdateAsync(Recommendation recommendation);
    Task<bool> DeleteAsync(int id);
    Task<IEnumerable<Recommendation>> GetAllWithJoinsAsync();
    Task<IEnumerable<Recommendation>> GetForStudentAsync(int studentId);
}
