# Secrets
data "aws_secretsmanager_secret" "queue" {
    name = "hotline/queue"
}

data "aws_secretsmanager_secret" "database" {
    name = "hotline/database"
}

data "aws_secretsmanager_secret" "api_database" {
    name = "hotline/api/database"
}

data "aws_secretsmanager_secret" "s3" {
    name = "hotline/s3"
}

# Policy
data "aws_iam_policy_document" "_" {
    statement {
        sid     = "1"
        actions = [
            "secretsmanager:GetSecretValue",
            "secretsmanager:DescribeSecret"
        ]
        effect  = "Allow"

        resources = [
            data.aws_secretsmanager_secret.queue.arn,
            data.aws_secretsmanager_secret.database.arn,
            data.aws_secretsmanager_secret.api_database.arn,
            data.aws_secretsmanager_secret.s3.arn,
        ]
    }
}

# User
resource "aws_iam_user" "_" {
    name = "api-hotline-gg"
}

resource "aws_iam_access_key" "_" {
    user = aws_iam_user._.name
}

resource "aws_iam_user_policy" "_" {
    name   = "secrets_manager"
    user   = aws_iam_user._.name
    policy = data.aws_iam_policy_document._.json
}
