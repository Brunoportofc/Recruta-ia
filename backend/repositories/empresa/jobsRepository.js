import supabase from '../../config/supabase.js';

class JobsRepository {
  async findAll() {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar vagas: ${error.message}`);
    }

    return data || [];
  }

  async create(jobData) {
    const { data, error } = await supabase
      .from('jobs')
      .insert([jobData])
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar vaga: ${error.message}`);
    }

    return data;
  }

  async findById(id) {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Erro ao buscar vaga: ${error.message}`);
    }

    return data;
  }

  async update(id, jobData) {
    const { data, error } = await supabase
      .from('jobs')
      .update(jobData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar vaga: ${error.message}`);
    }

    return data;
  }

  async delete(id) {
    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao deletar vaga: ${error.message}`);
    }

    return true;
  }
}

export default new JobsRepository();

