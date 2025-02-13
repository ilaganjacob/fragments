# AWS Learner Lab EC2 Instance Startup Guide

## Initial Setup

1. Start AWS Learner Lab session:

   - Go to AWS Academy
   - Click "Modules" then "Learner Lab"
   - Click "Start Lab" (wait for green circle)
   - Click "AWS" button to open AWS Console

2. Navigate to EC2:
   - In AWS Console, search for "EC2"
   - Make sure you're in **us-east-1** (N. Virginia) region

## Starting an Existing Instance

If you already have an instance:

1. Go to EC2 > Instances
2. Select your instance
3. Click "Instance state" > "Start instance"
4. Wait for "Instance state" to show "Running"
5. Note the new "Public IPv4 DNS" - it changes each time!

## Creating a New Instance (if needed)

1. Click "Launch instance"
2. Configure:

   - Name: (e.g., "Lab 4")
   - AMI: Amazon Linux 2023
   - Instance type: t2.micro
   - Key pair: Use your existing key pair (e.g., ccp555-key-pair)
   - Network settings: Create security group
     - Allow SSH (port 22)
     - Allow Custom TCP (port 8080)

3. Click "Launch instance"
4. Wait for instance to start
5. Note the "Public IPv4 DNS"

## Connecting to Your Instance

### macOS/Linux:

1. Set key permissions:

```bash
chmod 400 ~/.ssh/ccp555-key-pair.pem
```

2. If you need to copy your project to EC2:

```bash
# First create a tarball of your project
cd fragments
npm pack

# Copy the tarball to EC2 (replace with your DNS)
scp -i ~/.ssh/ccp555-key-pair.pem fragments-0.0.1.tgz ec2-user@ec2-3-16-456-301.compute-1.amazonaws.com:
```

3. Connect to EC2:

```bash
# Basic SSH connection (replace with your DNS)
ssh -i ~/.ssh/ccp555-key-pair.pem ec2-user@ec2-3-16-456-301.compute-1.amazonaws.com
```

### Windows with PuTTY:

1. Open PuTTY
2. Enter Host Name: ec2-user@[your-instance-dns]
3. Configure SSH > Auth > Credentials:
   - Select your .ppk key file
4. Click "Open"

## Basic Setup After Connecting

```bash
# Update system packages
sudo yum update -y

# Install git if needed
sudo yum install -y git

# Install node using nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
exit
# Reconnect to SSH, then:
nvm install --lts
```

## Stopping Your Instance

1. In EC2 Console:
   - Select your instance
   - Click "Instance state" > "Stop instance"
2. End AWS Learner Lab session:
   - Return to Learner Lab window
   - Click "End Lab"

## Important Notes

- Your Public IPv4 DNS changes every time you stop/start the lab
- Always stop your instance AND end the lab when finished
- Your data persists between stops, but public DNS will change
- Security group settings persist between sessions
- Keep your .pem/.ppk key safe - you can't download it again

## Troubleshooting

- If connection times out:

  - Check security group allows SSH (port 22)
  - Verify instance is fully started
  - Confirm you're using correct DNS
  - Make sure lab environment is started (green circle)

- If key pair doesn't work:
  - Verify key permissions (chmod 400)
  - Confirm using correct username (ec2-user)
  - Check key pair matches instance

Remember: Always check your AWS Academy credits usage and stop instances when not in use!
