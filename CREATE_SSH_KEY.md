# Create SSH Key for EC2

## Step 1: Generate SSH Key Pair

On your Mac, run:

```bash
# Generate a new SSH key (replace 'ec2-pivot-key' with your preferred name)
ssh-keygen -t rsa -b 4096 -f ~/.ssh/ec2-pivot-key -C "EC2 PIVOT Deployment"

# When prompted:
# - Press Enter to use default passphrase (or set one for security)
# - Press Enter again to confirm
```

This creates two files:
- `~/.ssh/ec2-pivot-key` (private key - keep this secret!)
- `~/.ssh/ec2-pivot-key.pub` (public key - this goes on EC2)

## Step 2: Add Public Key to EC2 Instance

You have two options:

### Option A: Using AWS Console (Easiest)

1. **Get your public key:**
   ```bash
   cat ~/.ssh/ec2-pivot-key.pub
   ```
   Copy the entire output (starts with `ssh-rsa...`)

2. **Add to EC2 via AWS Console:**
   - Go to EC2 Console → Your Instance → Connect
   - Click "EC2 Instance Connect" or "Session Manager"
   - Or use "EC2 Serial Console" if available
   - Once connected, run:
     ```bash
     # Create .ssh directory if it doesn't exist
     mkdir -p ~/.ssh
     chmod 700 ~/.ssh
     
     # Add your public key
     echo "YOUR_PUBLIC_KEY_HERE" >> ~/.ssh/authorized_keys
     chmod 600 ~/.ssh/authorized_keys
     ```

### Option B: Using EC2 Instance Connect (Recommended)

1. **In AWS Console:**
   - Go to EC2 → Your Instance (i-027e3d5d672eb15b8)
   - Click "Connect" button
   - Choose "EC2 Instance Connect" tab
   - Click "Connect"

2. **Once connected, add your public key:**
   ```bash
   # Get your public key from your Mac first:
   # On your Mac, run: cat ~/.ssh/ec2-pivot-key.pub
   # Then copy the output
   
   # On EC2, run:
   mkdir -p ~/.ssh
   chmod 700 ~/.ssh
   nano ~/.ssh/authorized_keys
   # Paste your public key, save (Ctrl+X, Y, Enter)
   chmod 600 ~/.ssh/authorized_keys
   ```

### Option C: Using AWS Systems Manager (If Instance Connect doesn't work)

1. **Make sure SSM agent is running on EC2:**
   ```bash
   # Check if SSM agent is installed (usually pre-installed on Amazon Linux)
   sudo systemctl status amazon-ssm-agent
   ```

2. **Use AWS Systems Manager Session Manager:**
   - Go to AWS Console → Systems Manager → Session Manager
   - Start a session with your instance
   - Follow Option B steps above

## Step 3: Test SSH Connection

From your Mac:

```bash
# Test connection (replace 'ec2-user' with 'ubuntu' if needed)
ssh -i ~/.ssh/ec2-pivot-key ec2-user@13.222.11.150

# If it works, you should see the EC2 prompt!
```

## Step 4: Configure SSH (Optional but Recommended)

Create/edit `~/.ssh/config` on your Mac:

```bash
nano ~/.ssh/config
```

Add:
```
Host ec2-pivot
    HostName 13.222.11.150
    User ec2-user
    IdentityFile ~/.ssh/ec2-pivot-key
    StrictHostKeyChecking no
```

Then you can connect simply with:
```bash
ssh ec2-pivot
```

## Troubleshooting

### "Permission denied (publickey)"
- Make sure you're using the correct username (`ec2-user` for Amazon Linux, `ubuntu` for Ubuntu)
- Verify the public key was added correctly to `~/.ssh/authorized_keys` on EC2
- Check file permissions on EC2:
  ```bash
  chmod 700 ~/.ssh
  chmod 600 ~/.ssh/authorized_keys
  ```

### "Connection refused"
- Check security group allows SSH (port 22) from your IP
- Verify instance is running

### "Host key verification failed"
- Remove old host key:
  ```bash
  ssh-keygen -R 13.222.11.150
  ```

## Security Notes

- **Never share your private key** (`~/.ssh/ec2-pivot-key`)
- **Keep your private key secure** - don't commit it to git
- Consider using a passphrase for extra security
- The public key (`~/.ssh/ec2-pivot-key.pub`) is safe to share

