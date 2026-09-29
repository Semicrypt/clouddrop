variable "aws_region" {
  description = "AWS region used for CloudDrop production infrastructure."
  type        = string
  default     = "eu-north-1"
}

variable "project_name" {
  description = "Project name used for AWS resource naming."
  type        = string
  default     = "clouddrop"
}

variable "environment" {
  description = "Deployment environment."
  type        = string
  default     = "production"
}

variable "application_role_name" {
  description = "IAM role assumed by the CloudDrop EC2 instance."
  type        = string
  default     = "CloudDropApplicationRole"
}
