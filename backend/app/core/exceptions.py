class AMDSFException(Exception):
    """Base exception for all AMDSF errors"""
    def __init__(self, message: str, domain: str = "SYSTEM"):
        super().__init__(message)
        self.message = message
        self.domain = domain

class ExternalServiceException(AMDSFException):
    """Raised when an external space telemetry API fails"""
    pass

class AgentProcessingException(AMDSFException):
    """Raised when an autonomous agent encounters an evaluation error"""
    pass

class OrchestratorException(AMDSFException):
    """Raised when cross-domain reasoning synthesis fails"""
    pass
