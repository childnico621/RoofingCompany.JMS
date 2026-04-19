using JobTracker.Modules.Jobs.Domain.SeedWork;
using NetArchTest.Rules;
using Xunit;

namespace JobTracker.Architecture.Tests;

public class ArchitectureTests
{
    private const string DomainNamespace = "JobTracker.Modules.Jobs.Domain";
    private const string ApplicationNamespace = "JobTracker.Modules.Jobs.Application";
    private const string InfrastructureNamespace = "JobTracker.Modules.Jobs.Infrastructure";

    [Fact]
    public void Domain_Should_Not_Have_Dependency_On_Other_Projects()
    {
        var result = Types.InAssembly(typeof(Entity).Assembly)
            .ShouldNot()
            .HaveDependencyOnAll(ApplicationNamespace, InfrastructureNamespace)
            .GetResult();

        Assert.True(result.IsSuccessful);
    }

    [Fact]
    public void Application_Should_Not_Have_Dependency_On_Infrastructure()
    {
        var result = Types.InAssembly(typeof(JobTracker.Modules.Jobs.Application.Jobs.JobResponse).Assembly)
            .ShouldNot()
            .HaveDependencyOn(InfrastructureNamespace)
            .GetResult();

        Assert.True(result.IsSuccessful);
    }

    [Fact]
    public void Handlers_Should_Have_Name_Ending_With_CommandHandler_Or_QueryHandler()
    {
        var result = Types.InAssembly(typeof(JobTracker.Modules.Jobs.Application.Jobs.JobResponse).Assembly)
            .That()
            .ImplementInterface(typeof(MediatR.IRequestHandler<,>))
            .Should()
            .HaveNameEndingWith("CommandHandler")
            .Or()
            .HaveNameEndingWith("QueryHandler")
            .GetResult();

        Assert.True(result.IsSuccessful);
    }
}
