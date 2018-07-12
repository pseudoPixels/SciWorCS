 public void compact() throws IOException {
        DirWriter writer = fact.newDirWriter(dirFile, encodeParam());
        long t1 = System.currentTimeMillis();
        long len1 = dirFile.length();
        try {
            writer = writer.compact();
        } finally {
            writer.close();
        }
        long t2 = System.currentTimeMillis();
        long len2 = dirFile.length();
        System.out.println(MessageFormat.format(messages.getString("compactDone"), new Object[] { dirFile, String.valueOf(len1), String.valueOf(len2), String.valueOf((t2 - t1) / 1000f) }));
    }