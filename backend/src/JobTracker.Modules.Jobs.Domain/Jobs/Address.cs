using JobTracker.Modules.Jobs.Domain.SeedWork;

namespace JobTracker.Modules.Jobs.Domain.Jobs;

public class Address : ValueObject
{
    public string Street { get; }
    public string City { get; }
    public string State { get; }
    public string ZipCode { get; }
    public double Latitude { get; }
    public double Longitude { get; }

    public Address(string street, string city, string state, string zipCode, double latitude, double longitude)
    {
        Street = street;
        City = city;
        State = state;
        ZipCode = zipCode;
        Latitude = latitude;
        Longitude = longitude;
    }

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return Street;
        yield return City;
        yield return State;
        yield return ZipCode;
        yield return Latitude;
        yield return Longitude;
    }
}
