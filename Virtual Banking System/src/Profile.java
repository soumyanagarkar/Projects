import javax.imageio.ImageIO;
import javax.swing.*;
import java.awt.*;
import java.io.File;
import java.sql.*;

class Profile extends JFrame {
    private Image backgroundImage;

    Profile(String username) {
        // Load the background image
        try {
            backgroundImage = ImageIO.read(new File("./bg.jpg")); // Ensure the path is correct
        } catch (Exception e) {
            JOptionPane.showMessageDialog(null, e.getMessage());
        }

        Font f = new Font("Futura", Font.BOLD, 35);
        Font f2 = new Font("Calibri", Font.PLAIN, 20);

        JLabel title = new JLabel("Profile Settings", JLabel.CENTER);
        title.setFont(f);

        JLabel l1 = new JLabel("Select Field to Update:");
        JComboBox<String> box = new JComboBox<>(new String[]{"Username", "Password", "Phone", "Email"});

        JLabel l2 = new JLabel("Enter New Value:");
        JTextField t1 = new JTextField(15);

        JButton b1 = new JButton("Update");
        JButton b2 = new JButton("Back");

        l1.setFont(f2);
        box.setFont(f2);
        l2.setFont(f2);
        t1.setFont(f2);
        b1.setFont(f2);
        b2.setFont(f2);

        // Create a custom JPanel to draw the background image
        ImagePanel mainPanel = new ImagePanel();
        mainPanel.setLayout(null); // Use absolute positioning

        // Set bounds for components
        title.setBounds(250, 20, 300, 40);
        l1.setBounds(200, 100, 200, 30);
        box.setBounds(400, 100, 200, 30);
        l2.setBounds(200, 160, 200, 30);
        t1.setBounds(400, 160, 200, 30);
        b1.setBounds(250, 220, 120, 40);
        b2.setBounds(400, 220, 120, 40);

        // Add components to the main panel
        mainPanel.add(title);
        mainPanel.add(l1);
        mainPanel.add(box);
        mainPanel.add(l2);
        mainPanel.add(t1);
        mainPanel.add(b1);
        mainPanel.add(b2);

        // Add the main panel to the frame
        Container c = getContentPane();
        c.add(mainPanel);

        b2.addActionListener(a -> {
            new Home(username);
            dispose();
        });

        b1.addActionListener(a -> {
            String s1 = box.getSelectedItem().toString().toLowerCase();
            String s2 = t1.getText();

            if (s2.isEmpty()) {
                JOptionPane.showMessageDialog(null, "Enter a new value");
                return;
            }

            String url = "jdbc:mysql://localhost:3306/batch2";

            try (Connection con = DriverManager.getConnection(url, "root", "Soumya@29")) {
                String sql = "update users set " + s1 + "=? where username=?";
                try (PreparedStatement pst = con.prepareStatement(sql)) {
                    pst.setString(1, s2);
                    pst.setString(2, username);
                    pst.executeUpdate();
                    JOptionPane.showMessageDialog(null, "Successfully Updated");
                }
            } catch (Exception e) {
                JOptionPane.showMessageDialog(null, e.getMessage());
                return;
            }

            if (s1.equals("username")) {
                dispose();
                new Profile(s2);
                try (Connection con = DriverManager.getConnection(url, "root", "Soumya@29")) {
                    String sql = "update users set username=? where username=?";
                    try (PreparedStatement pst = con.prepareStatement(sql)) {
                        pst.setString(1, s2);
                        pst.setString(2, username);
                        pst.executeUpdate();
                    }
                } catch (Exception e) {
                    JOptionPane.showMessageDialog(null, e.getMessage());
                }
            }

            t1.setText("");
        });

        setVisible(true);
        setSize(800, 550);
        setLocationRelativeTo(null);
        setDefaultCloseOperation(EXIT_ON_CLOSE);
        setTitle("Profile Settings");
    }

    private class ImagePanel extends JPanel {
        @Override
        protected void paintComponent(Graphics g) {
            super.paintComponent(g);
            if (backgroundImage != null) {
                g.drawImage(backgroundImage, 0, 0, getWidth(), getHeight(), this);
            }
        }
    }


        public static void main(String[] args) {
            new Profile("swati");
        }
    }


